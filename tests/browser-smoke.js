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
await send('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 800));

const initial = await evaluate(`(() => ({
  title: document.querySelector('#curriculum-heading')?.textContent,
  phases: document.querySelectorAll('.phase-step').length,
  checkpointCount: document.querySelectorAll('.evidence-button').length,
  progress: document.querySelector('.curriculum-progress')?.getAttribute('aria-valuenow'),
  studyButton: document.querySelector('[data-action="toggle-tfm"]')?.textContent.trim()
}))()`);
assert.deepEqual(initial, {
  title: 'Tabular foundation models', phases: 8, checkpointCount: 3,
  progress: '0', studyButton: 'Log today’s study'
});

await evaluate(`document.querySelector('[data-action="toggle-checkpoint"]').click()`);
await evaluate(`document.querySelector('[data-action="toggle-tfm"]').click()`);
assert.equal(await evaluate(`document.querySelector('#curriculum-percent').textContent`), '4%');
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-tfm"]').textContent.trim()`), '✓ Study logged today');

await send('Page.reload');
await new Promise((resolve) => setTimeout(resolve, 600));
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-checkpoint"]').getAttribute('aria-pressed')`), 'true');
assert.equal(await evaluate(`document.querySelector('[data-action="toggle-tfm"]').textContent.trim()`), '✓ Study logged today');

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const mobile = await evaluate(`(() => ({
  viewport: document.documentElement.clientWidth,
  overflow: document.documentElement.scrollWidth,
  missionWidth: Math.round(document.querySelector('.mission-panel').getBoundingClientRect().width),
  phaseRailScrollable: document.querySelector('.phase-rail').scrollWidth > document.querySelector('.phase-rail').clientWidth
}))()`);
assert.equal(mobile.viewport, 390);
assert.equal(mobile.overflow, 390, 'page should not overflow horizontally');
assert.ok(mobile.missionWidth <= 350, 'mission content should fit the mobile viewport');
assert.equal(mobile.phaseRailScrollable, true, 'phase navigation should scroll horizontally on mobile');
assert.deepEqual(errors, [], 'the core flow should produce no page console errors');

socket.close();
console.log('browser smoke tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
