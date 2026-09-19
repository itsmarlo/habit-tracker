const assert = require('node:assert/strict');

async function run() {
const endpoint = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:8000';
const pages = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === 'page');
assert.ok(page, 'Chrome must expose a debuggable page');

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let id = 0;
const errors = [];

socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push('console error');
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Storage.clearDataForOrigin', { origin: appUrl, storageTypes: 'local_storage' });
await send('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 800));

const initial = await evaluate(`(() => ({
  title: document.querySelector('#path-dialog #curriculum-heading')?.textContent,
  curriculumOnHome: Boolean(document.querySelector('main #curriculum-heading')),
  pathDialogOpen: document.querySelector('#path-dialog')?.open,
  pathTrigger: document.querySelector('[data-action="open-path"]')?.textContent.replace(/\\s+/g, ' ').trim(),
  pathTriggerCount: document.querySelectorAll('[data-action="open-path"]').length,
  pathOption: document.querySelector('#habit-path option[value="tfm-professional"]')?.textContent,
  customPathOption: document.querySelector('#habit-path option[value="custom"]')?.textContent,
  loggingHelp: document.querySelector('#logging-help')?.textContent.replace(/\\s+/g, ' ').trim(),
  heatmapMode: document.querySelector('#heatmap-mode')?.textContent.trim(),
  heatmapHabitOptions: [...document.querySelectorAll('#heatmap-habit-select option')].map((option) => option.textContent),
  phases: document.querySelectorAll('.phase-step').length,
  checkpointCount: document.querySelectorAll('.evidence-button').length,
  progress: document.querySelector('.curriculum-progress')?.getAttribute('aria-valuenow'),
  studyButton: document.querySelector('[data-action="toggle-path-habit"]')?.textContent.trim(),
  weekdays: [...document.querySelectorAll('.weekday-label')].map((label) => label.textContent)
}))()`);
assert.deepEqual(initial, {
  title: 'Tabular foundation models', curriculumOnHome: false, pathDialogOpen: false,
  pathTrigger: 'Learning path 00 · Diagnostic & setup Next · Explain the core ideas from memory',
  pathTriggerCount: 1, pathOption: 'TFM professional syllabus', customPathOption: 'Create a custom path',
  loggingHelp: 'How to log: Log today with the circle. To backfill, select a habit name, then choose a day in the heatmap.',
  heatmapMode: 'Logging: Move for 30 minutes',
  heatmapHabitOptions: ['Move for 30 minutes', 'Read something nourishing', 'Make one thing better', 'Study tabular foundation models'],
  phases: 8, checkpointCount: 3,
  progress: '0', studyButton: 'Log today’s study',
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
});

await evaluate(`(() => { const picker = document.querySelector('#heatmap-habit-select'); picker.value = 'read'; picker.dispatchEvent(new Event('change', { bubbles: true })); })()`);
assert.equal(await evaluate(`document.querySelector('#heatmap-mode').textContent.trim()`), 'Logging: Read something nourishing');
await evaluate(`document.querySelector('.heat-cell:not(.future)').click()`);
assert.match(await evaluate(`document.querySelector('[data-action="focus"][data-id="read"] .habit-meta').textContent`), /1 completion recorded/);
assert.match(await evaluate(`document.querySelector('[data-action="focus"][data-id="move"] .habit-meta').textContent`), /0 completions recorded/);

await evaluate(`document.querySelector('[data-action="toggle"][data-id="focus"]').click()`);
assert.equal(await evaluate(`document.querySelector('#heatmap-habit-select').value`), 'focus');
assert.equal(await evaluate(`document.querySelector('#heatmap-mode').textContent.trim()`), 'Logging: Make one thing better');

await evaluate(`document.querySelector('[data-action="open-path"][data-id="tfm-professional-practice"]').click()`);
assert.equal(await evaluate(`document.querySelector('#path-dialog').open`), true);
await evaluate(`document.querySelector('[data-action="toggle-checkpoint"]').click()`);
assert.match(await evaluate(`document.querySelector('[data-action="open-path"][data-id="tfm-professional-practice"]').textContent.replace(/\\s+/g, ' ').trim()`), /Next · Create the phase’s reproducible artifact$/);
await evaluate(`document.querySelector('[data-action="toggle-path-habit"]').click()`);
assert.equal(await evaluate(`document.querySelector('#curriculum-percent').textContent`), '4%');
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-path-habit"]').textContent.trim()`), '✓ Study logged today');
await evaluate(`document.querySelector('#close-path-dialog').click()`);

await evaluate(`document.querySelector('[data-action="edit"][data-id="move"]').click()`);
await evaluate(`(() => { document.querySelector('#habit-path').value = 'tfm-professional'; document.querySelector('#habit-form').requestSubmit(); })()`);
assert.equal(await evaluate(`document.querySelectorAll('[data-action="open-path"]').length`), 2);
await evaluate(`document.querySelector('[data-action="open-path"][data-id="move"]').click()`);
assert.equal(await evaluate(`document.querySelector('#curriculum-percent').textContent`), '0%');
await evaluate(`document.querySelector('#close-path-dialog').click()`);

await evaluate(`document.querySelector('[data-action="edit"][data-id="focus"]').click()`);
await evaluate(`(() => {
  const picker = document.querySelector('#habit-path');
  picker.value = 'custom';
  picker.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('#custom-path-title').value = 'JavaScript foundations';
  document.querySelector('#custom-path-steps').value = 'Variables and types\\nFunctions\\nBuild a small app';
  document.querySelector('#habit-form').requestSubmit();
})()`);
assert.equal(await evaluate(`document.querySelectorAll('[data-action="open-path"]').length`), 3);
assert.match(await evaluate(`document.querySelector('[data-action="open-path"][data-id="focus"]').textContent.replace(/\\s+/g, ' ').trim()`), /0\/3 · JavaScript foundations Next · Variables and types$/);
await evaluate(`document.querySelector('[data-action="open-path"][data-id="focus"]').click()`);
assert.equal(await evaluate(`document.querySelector('#curriculum-heading').textContent`), 'JavaScript foundations');
assert.equal(await evaluate(`document.querySelectorAll('[data-action="toggle-custom-step"]').length`), 3);
await evaluate(`document.querySelector('[data-action="toggle-custom-step"]').click()`);
assert.equal(await evaluate(`document.querySelector('#curriculum-percent').textContent`), '33%');
assert.match(await evaluate(`document.querySelector('[data-action="open-path"][data-id="focus"]').textContent.replace(/\\s+/g, ' ').trim()`), /1\/3 · JavaScript foundations Next · Functions$/);
await evaluate(`document.querySelector('#close-path-dialog').click()`);

await send('Page.reload');
await new Promise((resolve) => setTimeout(resolve, 600));
assert.equal(await evaluate(`document.querySelectorAll('[data-action="open-path"]').length`), 3);
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-checkpoint"]').getAttribute('aria-pressed')`), 'true');
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-path-habit"]').textContent.trim()`), '✓ Study logged today');

await evaluate(`document.querySelector('[data-action="open-path"][data-id="focus"]').click()`);
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-custom-step"]').getAttribute('aria-pressed')`), 'true');
await evaluate(`document.querySelector('#close-path-dialog').click()`);

await evaluate(`document.querySelector('[data-action="open-path"][data-id="move"]').click()`);
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const mobile = await evaluate(`(() => ({
  viewport: document.documentElement.clientWidth,
  overflow: document.documentElement.scrollWidth,
  missionWidth: Math.round(document.querySelector('.mission-panel').getBoundingClientRect().width),
  phaseRailScrollable: document.querySelector('.phase-rail').scrollWidth > document.querySelector('.phase-rail').clientWidth,
  overflowSources: [...document.querySelectorAll('body *')].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
  }).slice(0, 8).map((element) => ({ tag: element.tagName, className: element.className, rect: element.getBoundingClientRect().toJSON() }))
}))()`);
assert.equal(mobile.viewport, 390);
assert.equal(mobile.overflow, 390, `page should not overflow horizontally: ${JSON.stringify(mobile.overflowSources)}`);
assert.ok(mobile.missionWidth <= 350, 'mission content should fit the mobile viewport');
assert.equal(mobile.phaseRailScrollable, true, 'phase navigation should scroll horizontally on mobile');

await evaluate(`document.querySelector('#close-path-dialog').click()`);
await evaluate(`document.querySelector('[data-action="edit"][data-id="move"]').click()`);
await evaluate(`(() => { document.querySelector('#habit-path').value = ''; document.querySelector('#habit-form').requestSubmit(); })()`);
assert.equal(await evaluate(`document.querySelectorAll('[data-action="open-path"]').length`), 2, 'choosing no path detaches it from the habit');

await evaluate(`document.querySelector('[data-action="edit"][data-id="focus"]').click()`);
const mobileEditor = await evaluate(`(() => {
  const dialog = document.querySelector('#habit-dialog');
  const rect = dialog.getBoundingClientRect();
  return { customFieldsVisible: !document.querySelector('#custom-path-fields').hidden, top: rect.top, bottom: rect.bottom };
})()`);
assert.equal(mobileEditor.customFieldsVisible, true);
assert.ok(mobileEditor.top >= 8 && mobileEditor.bottom <= 836, 'custom path editor should remain within the mobile viewport');
await evaluate(`document.querySelector('#close-dialog').click()`);
assert.deepEqual(errors, [], 'the core flow should produce no page console errors');

socket.close();
console.log('browser smoke tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
