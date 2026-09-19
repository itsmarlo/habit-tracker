const STORAGE_KEY = 'commitment-graph-v1';
const CURRICULUM_STORAGE_KEY = 'tfm-learning-path-v1';
const TFM_HABIT_ID = 'tfm-professional-practice';
const today = new Date();
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fallbackHabits = [
  { id: 'move', name: 'Move for 30 minutes', color: '#238636', completions: {} },
  { id: 'read', name: 'Read something nourishing', color: '#d97746', completions: {} },
  { id: 'focus', name: 'Make one thing better', color: '#5572a7', completions: {} },
  { id: TFM_HABIT_ID, name: 'Study tabular foundation models', color: '#247b6b', completions: {} }
];

let state = loadState();
let curriculumState = loadCurriculumState();
let selectedHabitId = state.habits[0]?.id || null;
const els = {
  list: document.querySelector('#habit-list'), heatmap: document.querySelector('#heatmap'),
  streak: document.querySelector('#streak-stat'), month: document.querySelector('#month-stat'),
  best: document.querySelector('#best-habit-stat'), bestNote: document.querySelector('#best-habit-note'),
  todayCount: document.querySelector('#today-count'), summary: document.querySelector('#completion-summary'),
  dialog: document.querySelector('#habit-dialog'), form: document.querySelector('#habit-form'),
  name: document.querySelector('#habit-name'), color: document.querySelector('#habit-color'), id: document.querySelector('#habit-id'),
  toast: document.querySelector('#toast'), phaseRail: document.querySelector('#phase-rail'),
  mission: document.querySelector('#mission-panel'), practice: document.querySelector('#practice-panel'),
  curriculumPercent: document.querySelector('#curriculum-percent'), curriculumBar: document.querySelector('#curriculum-progress-bar'),
  curriculumProgress: document.querySelector('.curriculum-progress')
};

document.querySelector('#today-label').textContent = today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
document.querySelector('#year-heading').textContent = today.getFullYear();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return { habits: structuredClone(fallbackHabits) };
    const saved = JSON.parse(stored);
    if (isValidState(saved)) return saved;
  } catch (error) { console.warn('Could not read saved data.', error); }
  return { habits: structuredClone(fallbackHabits) };
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadCurriculumState() {
  const fallback = { selectedPhase: 'diagnostic', checkpoints: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(CURRICULUM_STORAGE_KEY));
    return TfmCurriculum.isValidCurriculumState(saved) ? saved : fallback;
  } catch (error) { return fallback; }
}
function persistCurriculum() { localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(curriculumState)); }
function isValidState(candidate) {
  if (!candidate || !Array.isArray(candidate.habits)) return false;
  const ids = new Set();
  return candidate.habits.every((habit) => {
    if (ids.has(habit?.id)) return false;
    ids.add(habit?.id);
    const validCompletions = habit.completions && typeof habit.completions === 'object' && !Array.isArray(habit.completions);
    const validCompletionKeys = validCompletions && Object.entries(habit.completions).every(([key, value]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(new Date(`${key}T00:00:00`).getTime()) && dateKey(new Date(`${key}T00:00:00`)) === key && typeof value === 'boolean');
    return habit && typeof habit.id === 'string' && /^[\w-]+$/.test(habit.id) && typeof habit.name === 'string' && habit.name.trim().length > 0 && habit.name.length <= 40 && typeof habit.color === 'string' && /^#[0-9a-f]{6}$/i.test(habit.color) && validCompletionKeys;
  });
}
function completionCount(habit) { return Object.values(habit.completions).filter(Boolean).length; }
function isComplete(habit, key = dateKey(today)) { return Boolean(habit.completions[key]); }
function formatCount(count, singular, plural = `${singular}s`) { return `${count} ${count === 1 ? singular : plural}`; }
function allCompletionDates() {
  return [...new Set(state.habits.flatMap((habit) => Object.keys(habit.completions).filter((key) => habit.completions[key])))];
}
function currentStreak() {
  let cursor = new Date(today);
  let streak = 0;
  while (allCompletionDates().includes(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
function toggleCompletion(habitId, key = dateKey(today)) {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit || new Date(`${key}T00:00:00`) > today) return;
  habit.completions[key] = !habit.completions[key];
  persist(); render();
}
function renderHabits() {
  if (!state.habits.length) {
    els.list.innerHTML = '<div class="empty-state"><h3>Make a small beginning.</h3><p>Add a habit you want to carry with you.</p><button class="button button-dark" type="button" data-action="add">+ Add your first habit</button></div>';
    return;
  }
  els.list.innerHTML = state.habits.map((habit) => {
    const done = isComplete(habit);
    const count = completionCount(habit);
    return `<article class="habit-row ${selectedHabitId === habit.id ? 'selected' : ''}" style="--habit-color:${habit.color}"><button class="check-button ${done ? 'done' : ''}" type="button" data-action="toggle" data-id="${habit.id}" aria-label="${done ? 'Undo' : 'Complete'} ${escapeHtml(habit.name)} for today">${done ? '✓' : ''}</button><div><button class="habit-name-button" type="button" data-action="focus" data-id="${habit.id}"><span class="habit-name">${escapeHtml(habit.name)}</span><span class="habit-meta">${formatCount(count, 'completion')} recorded</span></button></div><div class="habit-actions"><button class="icon-button" type="button" data-action="edit" data-id="${habit.id}" aria-label="Edit ${escapeHtml(habit.name)}">Edit</button><button class="icon-button" type="button" data-action="delete" data-id="${habit.id}" aria-label="Delete ${escapeHtml(habit.name)}">Delete</button></div></article>`;
  }).join('');
}
function renderHeatmap() {
  const year = today.getFullYear();
  const start = new Date(year, 0, 1); start.setDate(start.getDate() - start.getDay());
  const end = new Date(year, 11, 31); end.setDate(end.getDate() + (6 - end.getDay()));
  const days = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) days.push(new Date(date));
  const monthStarts = {};
  days.forEach((date, index) => { const week = Math.floor(index / 7); if (date.getFullYear() === year && date.getDate() === 1) monthStarts[week] = date.toLocaleDateString(undefined, { month: 'short' }); });
  const cells = ['<div></div>', ...Array.from({ length: 53 }, (_, week) => `<span class="month-label" style="grid-column:${week + 2};grid-row:1">${monthStarts[week] || ''}</span>`), ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => `<span class="weekday-label" style="grid-column:1;grid-row:${index + 2}">${label}</span>`), ...days.map((date) => {
    const key = dateKey(date); const count = state.habits.filter((habit) => isComplete(habit, key)).length; const future = date > today || date.getFullYear() !== year;
    const detail = `${key}: ${formatCount(count, 'habit')} complete`;
    return `<button class="heat-cell level-${Math.min(count, 3)} ${future ? 'future' : ''}" style="grid-column:${Math.floor(days.indexOf(date) / 7) + 2};grid-row:${(date.getDay() || 7) + 1}" type="button" data-date="${key}" title="${detail}" aria-label="${detail}" ${future ? 'disabled' : ''}></button>`;
  })];
  els.heatmap.innerHTML = `<div class="heatmap">${cells.join('')}</div>`;
}
function renderStats() {
  const todayDone = state.habits.filter((habit) => isComplete(habit)).length;
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const possible = state.habits.length * today.getDate();
  const kept = state.habits.reduce((sum, habit) => sum + Object.keys(habit.completions).filter((key) => key.startsWith(monthPrefix) && habit.completions[key]).length, 0);
  const best = [...state.habits].sort((a, b) => completionCount(b) - completionCount(a))[0];
  els.todayCount.textContent = `${todayDone} / ${state.habits.length} done`;
  els.summary.textContent = `${formatCount(allCompletionDates().reduce((sum, key) => sum + state.habits.filter((habit) => isComplete(habit, key)).length, 0), 'commitment')} completed`;
  els.streak.textContent = currentStreak(); els.month.textContent = possible ? `${Math.round((kept / possible) * 100)}%` : '0%';
  els.best.textContent = best ? best.name : '—'; els.bestNote.textContent = best ? `${completionCount(best)} total recorded` : 'Start a habit to see it here';
}
function getTfmHabit() { return state.habits.find((habit) => habit.id === TFM_HABIT_ID); }
function renderCurriculum() {
  const habit = getTfmHabit();
  const studyDays = habit ? completionCount(habit) : 0;
  const paceWeek = Math.min(32, Math.ceil(studyDays / 5));
  const recommended = TfmCurriculum.phaseForStudyDays(studyDays);
  const selected = TfmCurriculum.PHASES.find((phase) => phase.id === curriculumState.selectedPhase) || recommended;
  const progress = TfmCurriculum.curriculumProgress(curriculumState);
  const checkpoints = curriculumState.checkpoints[selected.id] || {};
  const todayLogged = habit ? isComplete(habit) : false;
  const checkpointCopy = {
    learn: ['Reconstruct', 'Explain the core ideas from memory'],
    build: ['Produce', 'Create the phase’s reproducible artifact'],
    defend: ['Defend', 'Pass the gate and record the evidence']
  };

  els.curriculumPercent.textContent = `${progress.percentage}%`;
  els.curriculumBar.style.width = `${progress.percentage}%`;
  els.curriculumProgress.setAttribute('aria-valuenow', progress.percentage);
  els.phaseRail.innerHTML = TfmCurriculum.PHASES.map((phase) => {
    const complete = TfmCurriculum.CHECKPOINTS.every((key) => curriculumState.checkpoints[phase.id]?.[key]);
    return `<button class="phase-step ${phase.id === selected.id ? 'selected' : ''} ${phase.id === recommended.id ? 'current' : ''} ${complete ? 'complete' : ''}" type="button" data-action="select-phase" data-phase="${phase.id}" aria-current="${phase.id === selected.id ? 'step' : 'false'}"><span class="phase-number">${complete ? '✓' : phase.number}</span><span><strong>${phase.title}</strong><small>${phase.weeks}</small></span></button>`;
  }).join('');
  els.mission.innerHTML = `<div class="mission-topline"><span>${selected.weeks}</span><span>${selected.target ? `Gate ≥ ${selected.target}` : 'Placement gate'}</span></div><p class="mission-label">${selected.short}</p><h3>${selected.title}</h3><p class="mission-focus">${selected.focus}</p>${selected.reading ? `<p class="assigned-reading"><strong>Assigned reading</strong>${selected.reading}</p>` : ''}<dl class="mission-brief"><div><dt>Build</dt><dd>${selected.build}</dd></div><div><dt>Gate</dt><dd>${selected.gate}</dd></div></dl><div class="evidence-list"><p>Evidence checkpoints</p>${TfmCurriculum.CHECKPOINTS.map((key) => `<button type="button" class="evidence-button ${checkpoints[key] ? 'complete' : ''}" data-action="toggle-checkpoint" data-phase="${selected.id}" data-checkpoint="${key}" aria-pressed="${Boolean(checkpoints[key])}"><span class="evidence-check" aria-hidden="true">${checkpoints[key] ? '✓' : ''}</span><span><strong>${checkpointCopy[key][0]}</strong><small>${checkpointCopy[key][1]}</small></span></button>`).join('')}</div>`;
  els.practice.innerHTML = `<p class="section-kicker">Field rhythm</p><div class="pace-readout"><strong>${String(paceWeek).padStart(2, '0')}</strong><span>of 32<br>weeks paced</span></div><p class="pace-note">${studyDays} focused ${studyDays === 1 ? 'day' : 'days'} logged · target 5 per week</p><div class="rhythm-bars" aria-label="Recommended weekly time split"><div><span style="width:40%"></span><b>40% Build</b></div><div><span style="width:40%"></span><b>40% Study</b></div><div><span style="width:20%"></span><b>20% Critique</b></div></div>${habit ? `<button class="button ${todayLogged ? 'button-complete' : 'button-dark'} practice-action" type="button" data-action="toggle-tfm">${todayLogged ? '✓ Study logged today' : 'Log today’s study'}</button>` : '<button class="button button-dark practice-action" type="button" data-action="setup-tfm">Add this study habit</button>'}<p class="current-route"><span>Now recommended</span><strong>${recommended.number} · ${recommended.title}</strong></p>`;
}
function render() { renderHabits(); renderHeatmap(); renderStats(); renderCurriculum(); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function openDialog(habit) { els.id.value = habit?.id || ''; els.name.value = habit?.name || ''; els.color.value = habit?.color || '#238636'; document.querySelector('#dialog-title').textContent = habit ? 'Edit habit' : 'Add a habit'; document.querySelector('#dialog-kicker').textContent = habit ? 'Adjust your practice' : 'New practice'; els.dialog.showModal(); els.name.focus(); }
function showToast(message) { els.toast.textContent = message; els.toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove('visible'), 2400); }

document.addEventListener('click', (event) => { const control = event.target.closest('[data-action]'); const action = control?.dataset.action; if (action === 'add') openDialog(); if (action === 'toggle') toggleCompletion(control.dataset.id); if (action === 'focus') { selectedHabitId = control.dataset.id; renderHabits(); } if (action === 'select-phase') { curriculumState.selectedPhase = control.dataset.phase; persistCurriculum(); renderCurriculum(); } if (action === 'toggle-checkpoint') { const phase = control.dataset.phase; const checkpoint = control.dataset.checkpoint; curriculumState.checkpoints[phase] ||= {}; curriculumState.checkpoints[phase][checkpoint] = !curriculumState.checkpoints[phase][checkpoint]; persistCurriculum(); renderCurriculum(); showToast('Evidence checkpoint updated'); } if (action === 'setup-tfm') { state.habits.push({ id: TFM_HABIT_ID, name: 'Study tabular foundation models', color: '#247b6b', completions: {} }); selectedHabitId = TFM_HABIT_ID; persist(); render(); showToast('Study habit added'); } if (action === 'toggle-tfm') { toggleCompletion(TFM_HABIT_ID); showToast(isComplete(getTfmHabit()) ? 'Study day logged' : 'Study log undone'); } if (action === 'edit') openDialog(state.habits.find((habit) => habit.id === control.dataset.id)); if (action === 'delete') { const habit = state.habits.find((item) => item.id === control.dataset.id); if (!habit || !confirm(`Delete "${habit.name}" and its history?`)) return; state.habits = state.habits.filter((item) => item.id !== control.dataset.id); selectedHabitId = state.habits[0]?.id || null; persist(); render(); showToast('Habit removed'); } if (event.target.matches('.heat-cell:not(.future)')) { const date = event.target.dataset.date; const selectedHabit = state.habits.find((habit) => habit.id === selectedHabitId) || state.habits[0]; if (selectedHabit) { toggleCompletion(selectedHabit.id, date); showToast(`Updated ${date}`); } } });
document.querySelector('#add-habit-button').addEventListener('click', () => openDialog());
document.querySelector('#cancel-dialog').addEventListener('click', () => els.dialog.close());
document.querySelector('#close-dialog').addEventListener('click', () => els.dialog.close());
els.form.addEventListener('submit', (event) => { event.preventDefault(); const name = els.name.value.trim(); if (!name) { els.name.setCustomValidity('Enter a habit name.'); els.name.reportValidity(); return; } els.name.setCustomValidity(''); const existing = state.habits.find((habit) => habit.id === els.id.value); if (existing) { existing.name = name; existing.color = els.color.value; showToast('Habit updated'); } else { state.habits.push({ id: crypto.randomUUID(), name, color: els.color.value, completions: {} }); showToast('Habit added'); } persist(); els.dialog.close(); render(); });
document.querySelector('#export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `commitment-graph-${dateKey(today)}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('Backup downloaded'); });
document.querySelector('#import-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!isValidState(imported)) throw new Error('Invalid backup'); state = imported; selectedHabitId = state.habits[0]?.id || null; persist(); render(); showToast('Backup restored'); } catch (error) { showToast('That backup could not be read'); } }; reader.readAsText(file); event.target.value = ''; });
document.querySelector('#clear-data-button').addEventListener('click', () => { if (confirm('Reset all habits, curriculum progress, and history?')) { state = { habits: [] }; curriculumState = { selectedPhase: 'diagnostic', checkpoints: {} }; selectedHabitId = null; persist(); persistCurriculum(); render(); showToast('All data reset'); } });
render();
