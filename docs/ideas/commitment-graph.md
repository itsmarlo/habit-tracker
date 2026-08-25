# Commitment Graph

## Problem Statement
How might we help one person build visible momentum around daily habits without accounts, social pressure, or a complicated productivity system?

## Recommended Direction
Commitment Graph is a private, browser-only habit tracker inspired by GitHub's contribution graph. The year view makes consistency tangible, while a focused Today list keeps the daily action quick. Each habit has its own color, completion history, streak context, and editable details.

The product's differentiator is the combination of a familiar activity graph and zero setup: no account, server, or network dependency. Data lives in `localStorage`, with JSON export/import so the user remains in control of their history.

## Key Assumptions to Validate
- [ ] A contribution-style graph is motivating enough to bring a solo user back daily; test through repeated personal use over two weeks.
- [ ] A one-click Today flow is faster and more sustainable than a richer journaling workflow; compare completion friction during daily use.
- [ ] Users value portability even when data is local-only; test whether export/import is used during the first month.

## MVP Scope
- Yearly contribution heatmap with completion intensity
- Today's habit checklist
- Create, edit, and delete habits
- Toggle today's and historical completions
- Streak, monthly consistency, and best-habit summaries
- LocalStorage persistence
- JSON export and import
- Responsive, keyboard-accessible static browser experience

## Not Doing (and Why)
- Accounts or cloud sync — privacy and setup are part of the product promise.
- Reminders or notifications — they add platform complexity before the core loop is proven.
- Social sharing or leaderboards — external pressure changes the personal nature of the tool.
- Notes, mood tracking, or habit dependencies — these create friction and dilute the graph-first test.
- Recurring schedule rules — the MVP records practice rather than policing an ideal schedule.

## Open Questions
- Does the heatmap need one row per habit, or is an aggregate year view easier to read at a glance?
- Should a historical cell toggle the selected habit, or should history have a dedicated habit focus mode?
- What is the smallest weekly reflection that helps users adjust without becoming analytics work?
