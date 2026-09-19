const assert = require('node:assert/strict');
const {
  PHASES,
  curriculumProgress,
  phaseForStudyDays,
  phaseForEvidence,
  isValidLearningPathsState,
  isValidCurriculumState
} = require('../habit-tracker/curriculum.js');

assert.equal(PHASES.length, 8, 'the syllabus exposes all eight phases');
assert.match(PHASES.find((phase) => phase.id === 'tfm-core').reading, /Molnar chapters 1–5/, 'the updated core reading sequence is included');
assert.equal(phaseForStudyDays(0).id, 'diagnostic', 'the plan starts at the diagnostic');
assert.equal(phaseForStudyDays(30).id, 'baselines', '30 study days reaches phase 2');
assert.equal(phaseForStudyDays(160).id, 'capstone', 'the final study day reaches the capstone');
assert.equal(phaseForEvidence({ checkpoints: {} }).id, 'diagnostic', 'mastery starts at the first unfinished phase');
assert.equal(phaseForEvidence({ checkpoints: { diagnostic: { learn: true, build: true, defend: true } } }).id, 'foundations', 'mastery advances only after all phase evidence is complete');

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
assert.equal(isValidLearningPathsState({ attachments: { read: 'tfm-professional' }, curricula: { read: { selectedPhase: 'diagnostic', checkpoints: {} } } }), true);
assert.equal(isValidLearningPathsState({ attachments: { read: 'invented-template' }, curricula: {} }), false);
assert.equal(isValidLearningPathsState({ attachments: { 'unsafe id': 'tfm-professional' }, curricula: {} }), false);
assert.equal(isValidLearningPathsState({ attachments: 1, curricula: {} }), false);

console.log('curriculum tests passed');
