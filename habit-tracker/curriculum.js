(function exposeCurriculum(root) {
  const PHASES = [
    {
      id: 'diagnostic', number: '00', weeks: 'Week 0', startWeek: 0, endWeek: 0,
      title: 'Diagnostic & setup', short: 'Establish your baseline',
      focus: 'Python, data tooling, probability, validation, Git, and reproducible environments.',
      build: 'Complete the diagnostic and ship one leakage-safe classification baseline.',
      gate: 'Name uncertainty honestly and use the result to set your starting point.', target: null
    },
    {
      id: 'foundations', number: '01', weeks: 'Weeks 1–5', startWeek: 1, endWeek: 5,
      title: 'Statistical foundations', short: 'Make evaluation defensible',
      focus: 'Problem framing, leakage, splitting, calibration, uncertainty, and classic tabular models.',
      build: 'Create a reusable evaluation harness with grouped and temporal splits.',
      gate: 'Compare five model families across three datasets and defend every choice.', target: 80
    },
    {
      id: 'baselines', number: '02', weeks: 'Weeks 6–10', startWeek: 6, endWeek: 10,
      title: 'Strong baselines', short: 'Earn the right to compare',
      focus: 'Boosting, tuning bias, ensembling, meta-features, and benchmark design.',
      build: 'Reproduce a respected benchmark result on five datasets with cost accounting.',
      gate: 'Submit a four-page replication report with per-dataset evidence.', target: 82
    },
    {
      id: 'neural', number: '03', weeks: 'Weeks 11–14', startWeek: 11, endWeek: 14,
      title: 'Neural models for tables', short: 'Understand both sides',
      focus: 'MLPs, embeddings, FT-Transformer, attention, and tree inductive biases.',
      build: 'Implement an MLP and attention model under matched tuning budgets.',
      gate: 'Defend why neither “deep wins” nor “trees win” is a universal claim.', target: 82
    },
    {
      id: 'tfm-core', number: '04', weeks: 'Weeks 15–20', startWeek: 15, endWeek: 20,
      title: 'TFMs & PFNs', short: 'Enter the model core',
      focus: 'Meta-learning, amortized inference, task priors, TabPFN, TabICL, and TabDPT.',
      reading: 'Weeks 15–16: Molnar chapters 1–5. Week 17: reproduce one example from chapters 6–9 with a stronger evaluation protocol.',
      build: 'Create a toy PFN and benchmark TFM families across 10 varied datasets.',
      gate: 'Derive posterior predictive approximation and demonstrate prior mismatch.', target: 85
    },
    {
      id: 'trust', number: '05', weeks: 'Weeks 21–25', startWeek: 21, endWeek: 25,
      title: 'Trustworthy evaluation', short: 'Try to break your claims',
      focus: 'Calibration, conformal prediction, shift, fairness, privacy, and interpretability.',
      build: 'Create a red-team suite for leakage, shift, noise, and subgroup imbalance.',
      gate: 'Audit a study, identify five threats, and test two empirically.', target: 85
    },
    {
      id: 'production', number: '06', weeks: 'Weeks 26–28', startWeek: 26, endWeek: 28,
      title: 'Production & decisions', short: 'Make it survive reality',
      focus: 'Latency, cost, model versioning, monitoring, fallbacks, and decision thresholds.',
      build: 'Package a validated service with monitoring, a model card, and tree fallback.',
      gate: 'Pass a statistical, operational, ethical, and licensing review.', target: 85
    },
    {
      id: 'capstone', number: '07', weeks: 'Weeks 29–32', startWeek: 29, endWeek: 32,
      title: 'Professional capstone', short: 'Turn evidence into judgment',
      focus: 'A real problem, non-trivial split, fair comparison, and decision-aware recommendation.',
      build: 'Deliver the repository, ablations, model card, presentation, and executive brief.',
      gate: 'Score 85+ and defend the recommendation under adversarial questions.', target: 85
    }
  ];

  const CHECKPOINTS = ['learn', 'build', 'defend'];

  function phaseForStudyDays(studyDays) {
    const week = Math.min(32, Math.max(0, Math.ceil(Number(studyDays || 0) / 5)));
    return PHASES.find((phase) => week >= phase.startWeek && week <= phase.endWeek) || PHASES[PHASES.length - 1];
  }

  function curriculumProgress(state) {
    const completed = PHASES.reduce((total, phase) => total + CHECKPOINTS.filter((checkpoint) => state?.checkpoints?.[phase.id]?.[checkpoint] === true).length, 0);
    const total = PHASES.length * CHECKPOINTS.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }

  function phaseForEvidence(state) {
    return PHASES.find((phase) => !CHECKPOINTS.every((checkpoint) => state?.checkpoints?.[phase.id]?.[checkpoint] === true)) || PHASES[PHASES.length - 1];
  }

  function isValidCurriculumState(candidate) {
    if (!candidate || !PHASES.some((phase) => phase.id === candidate.selectedPhase)) return false;
    if (!candidate.checkpoints || typeof candidate.checkpoints !== 'object' || Array.isArray(candidate.checkpoints)) return false;
    return Object.entries(candidate.checkpoints).every(([phaseId, values]) =>
      PHASES.some((phase) => phase.id === phaseId) && values && typeof values === 'object' && !Array.isArray(values) &&
      Object.entries(values).every(([key, value]) => CHECKPOINTS.includes(key) && typeof value === 'boolean')
    );
  }

  const api = { PHASES, CHECKPOINTS, phaseForStudyDays, phaseForEvidence, curriculumProgress, isValidCurriculumState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TfmCurriculum = api;
}(typeof window === 'undefined' ? globalThis : window));
