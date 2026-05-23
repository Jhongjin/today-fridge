# Phase 71 Brief - Pause Resume Flow

## Goal

Make the visible pause control behave like a real gameplay pause without changing scoring or board state.

## Changes

- Added paused app state with a top-bar pause/resume toggle.
- Disabled board tiles and the hint booster while paused.
- Added a compact resume panel for mobile play.
- Recorded `game_pause` and `game_resume` analytics with score and move count.

## QA

- Browser coverage verifies pause analytics, disabled board input, resume state, and continued scoring after resume.

## Follow-Up

- Pause-adjusted round duration moved into Phase 72.
