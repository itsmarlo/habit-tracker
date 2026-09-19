const assert = require('node:assert/strict');
const {
  PHASES,
  curriculumProgress,
  phaseForStudyDays,
  isValidCurriculumState
} = require('../habit-tracker/curriculum.js');

assert.equal(PHASES.length, 8, 'the syllabus exposes all eight phases');
assert.match(PHASES.find((phase) => phase.id === 'tfm-core').reading, /Molnar chapters 1–5/, 'the updated core reading sequence is included');
assert.equal(phaseForStudyDays(0).id, 'diagnostic', 'the plan starts at the diagnostic');
assert.equal(phaseForStudyDays(30).id, 'baselines', '30 study days reaches phase 2');
assert.equal(phaseForStudyDays(160).id, 'capstone', 'the final study day reaches the capstone');

const progress = curriculumProgress({
  checkpoints: {
    diagnostic: { learn: true, build: true, defend: true },
    foundations: { learn: true, build: false, defend: false }
  }
});
assert.deepEqual(progress, { completed: 4, total: 24, percentage: 17 });

assert.equal(isValidCurriculumState({ selectedPhase: 'foundations', checkpoints: {} }), true);
assert.equal(isValidCurriculumState({ selectedPhase: 'invented', checkpoints: {} }), false);
assert.equal(isValidCurriculumState({ selectedPhase: 'diagnostic', checkpoints: { diagnostic: { learn: 'yes' } } }), false);

console.log('curriculum tests passed');
