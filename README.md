# Commitment Graph

A private, browser-only habit tracker built around a GitHub-style yearly contribution graph. It includes a dedicated 32-week field guide for reaching professional proficiency in tabular foundation models (TFMs), turning the syllabus into daily practice, evidence checkpoints, and phase gates.

## Quick start

No packages, accounts, or build step are required.

```bash
python3 -m http.server 8000 --directory habit-tracker
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Tracking the TFM syllabus

The **Professional field guide** adds three connected forms of progress:

- **Practice:** “Log today’s study” records the dedicated TFM habit in the yearly contribution graph. Five focused days advance the suggested weekly pace.
- **Curriculum:** an eight-phase rail covers diagnostic setup, foundations, baselines, neural models, TFMs/PFNs, trustworthy evaluation, production, and the capstone.
- **Evidence:** every phase requires three explicit checkpoints—reconstruct the ideas, produce the artifact, and defend the gate. Curriculum progress reflects these 24 evidence checkpoints, not reading time alone.

Select any phase to see its focus, build artifact, gate, and required score. The current recommendation follows study-day pace, but phase navigation remains open for review or catch-up.

The canonical plan is [Professional Syllabus: Tabular Foundation Models](docs/tfm-professional-syllabus.md). The current revision includes Molnar’s 2026 book sequence and the stronger reproduction and critical-reading protocol for Weeks 15–17.

## Privacy and persistence

All information stays in the browser’s `localStorage`; the app has no backend and sends no habit data to a server.

- Habit history uses `commitment-graph-v1`.
- TFM checkpoint progress uses the additive `tfm-learning-path-v1` record, keeping the existing habit backup schema compatible.
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
- Native buttons, visible focus states, accessible progress semantics, and horizontally scrollable phase navigation keep the field guide usable by keyboard and on small screens.
