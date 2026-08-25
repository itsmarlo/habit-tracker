# Spec: GitHub-like Habit Tracker

## Objective
Provide a private, browser-only habit tracker centered on a GitHub-style yearly contribution graph. Users can create habits, mark completions, inspect daily activity, and retain or transfer their data without an account.

## Tech Stack
- Static HTML, CSS, and browser JavaScript
- Browser `localStorage` for persistence
- No framework, backend, build step, or runtime dependency

## Commands
- Run locally: `python3 -m http.server 8000 --directory habit-tracker`
- Browser verification: open `http://127.0.0.1:8000`
- Automated tests: no existing test runner; use focused browser assertions for UI behavior

## Project Structure
- `habit-tracker/index.html` - semantic page structure and controls
- `habit-tracker/styles.css` - responsive visual system
- `habit-tracker/app.js` - state, persistence, rendering, and interactions
- `tests/` - focused browser checks as the test surface grows

## Code Style
Keep the existing dependency-free style: small named functions, semantic HTML, CSS custom properties, and event delegation for dynamic controls. Escape user-entered text before inserting it into generated markup.

## Testing Strategy
Use focused browser checks for critical flows: initial render, creating a habit, toggling today, toggling a historical graph cell, import/export, reset, and accessible graph labels. Run the browser check after each UI behavior slice and perform a responsive mobile check before completion.

## Boundaries
- Always: preserve local-only storage, validate imported data, escape habit names, and verify behavior in a browser.
- Ask first: adding dependencies, introducing a framework or backend, changing the storage schema, or changing the visual identity substantially.
- Never: send habit data to a server, commit secrets, remove validation, or claim browser verification without running it.

## Success Criteria
- The page loads as a usable GitHub-like contribution graph on desktop and mobile.
- Users can create, edit, delete, complete, and restore habits locally.
- Every graph cell communicates its date and completion count through an accessible name and a visible browser tooltip.
- Future dates cannot be completed.
- Empty, populated, and dialog states remain usable by keyboard.
- No console errors occur during the core flow.

## Open Questions
- None for this implementation slice.
