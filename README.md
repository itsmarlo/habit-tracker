# Commitment Graph

A private, browser-only habit tracker built around a GitHub-style yearly contribution graph. The included tabular foundation model (TFM) habit carries a structured Learning Path that turns its professional syllabus into daily practice, evidence checkpoints, and phase gates without changing the general-purpose home experience.

## Quick start

No packages, accounts, or build step are required.

```bash
python3 -m http.server 8000 --directory habit-tracker
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Tracking the TFM syllabus

The **Study tabular foundation models** habit includes a compact Path preview showing the current mastery phase and next evidence step. Opening it reveals three connected forms of progress:

- **Practice:** “Log today’s study” records the dedicated TFM habit in the yearly contribution graph. Five focused days advance the suggested weekly pace.
- **Curriculum:** an eight-phase Path covers diagnostic setup, foundations, baselines, neural models, TFMs/PFNs, trustworthy evaluation, production, and the capstone.
- **Evidence:** every phase requires three explicit checkpoints—reconstruct the ideas, produce the artifact, and defend the gate. Curriculum progress reflects these 24 evidence checkpoints, not reading time alone.

Select any phase inside the Path dialog to see its focus, build artifact, gate, and required score. Study days determine the suggested pace; the habit’s mastery phase advances only after all evidence checkpoints for the current phase are complete.

The canonical plan is [Professional Syllabus: Tabular Foundation Models](docs/tfm-professional-syllabus.md). The current revision includes Molnar’s 2026 book sequence and the stronger reproduction and critical-reading protocol for Weeks 15–17.

### Add the path to a habit

1. Create a habit or choose **Edit** on an existing one.
2. Under **Learning path**, select **TFM professional syllabus**.
3. Save the habit, then open its new **Learning path** preview.

Each attached habit keeps independent phase selections and evidence checkpoints. Choose **No learning path** in the edit dialog to detach it from a habit.

## Logging habits

- **Today:** select the circle beside a habit. Select it again to undo the completion.
- **A past day:** select the habit’s name first. The graph footer changes to **Logging: _habit name_**. Then select any non-future square in the yearly heatmap.
- **Switch habits:** select another habit name before choosing a heatmap day. The highlighted left border and graph footer identify the active habit.

Heatmap squares expose the date, completion count, and selected habit through their tooltip and accessible label.

## Privacy and persistence

All information stays in the browser’s `localStorage`; the app has no backend and sends no habit data to a server.

- Habit history uses `commitment-graph-v1`.
- Learning-path attachments and per-habit checkpoint progress use the additive `habit-learning-paths-v1` record. Existing `tfm-learning-path-v1` progress is migrated when first loaded.
- **Reset all data** clears both records after confirmation.

Habit export/import currently covers habit history. Curriculum evidence remains local to the browser and is intentionally stored separately.

## Commands

| Command | Purpose |
|---|---|
| `python3 -m http.server 8000 --directory habit-tracker` | Serve the app locally |
| `node tests/curriculum.test.js` | Test curriculum pace, progress, and validation logic |
| `node tests/graph-detail.test.js` | Load the graph accessibility assertion helpers |
| `tests/run-browser-smoke.sh` | Start isolated Chrome and run the real-browser flow |
| `node --check habit-tracker/app.js` | Check application JavaScript syntax |

The browser smoke test expects the app on port `8000` and Google Chrome at its standard macOS location. The underlying Node test also accepts `APP_URL` and `CHROME_DEBUG_URL` overrides.

## Project structure

```text
habit-tracker/
  index.html       Semantic page structure
  styles.css       Responsive visual system
  app.js           Habit state, persistence, rendering, and interactions
  curriculum.js    TFM phase data and pure progress logic
docs/
  tfm-professional-syllabus.md
tests/
  browser-smoke.js
  curriculum.test.js
  graph-detail.test.js
```

## Design choices

- Dependency-free HTML, CSS, and JavaScript preserve the original local-first architecture.
- Daily practice and professional evidence are deliberately separate: showing up matters, but a phase only advances toward mastery when its artifacts and defense are complete.
- The TFM syllabus is scoped to its habit through a Learning Path; ordinary habits and the main dashboard remain domain-neutral.
- Native buttons, visible focus states, accessible progress semantics, and horizontally scrollable phase navigation keep the Path usable by keyboard and on small screens.
