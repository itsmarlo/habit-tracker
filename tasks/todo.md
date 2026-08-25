# Tasks: Contribution Detail

- [x] Task 1: Add a failing browser assertion for graph cell detail
  - Acceptance: A graph cell is expected to expose its date and completion count.
  - Verify: Browser assertion fails before implementation.
  - Files: `tests/graph-detail.test.js`

- [x] Task 2: Add date/count detail to rendered graph cells
  - Acceptance: Each non-future graph cell has matching `title` and `aria-label` detail.
  - Verify: Focused browser assertion passes.
  - Files: `habit-tracker/app.js`, `tests/graph-detail.test.js`

- [x] Task 3: Review responsive and keyboard behavior
  - Acceptance: Core flow works on desktop and mobile with no console errors.
  - Verify: Browser smoke test and responsive viewport check.
  - Files: `habit-tracker/index.html`, `habit-tracker/styles.css`, `habit-tracker/app.js`

## Checkpoint: Complete
- [x] All acceptance criteria met
- [x] Final browser verification complete
