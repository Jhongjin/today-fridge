# Phase 73 Brief - Personal Best Chase Copy

## Goal

Make the replay target feel more immediate by clarifying the player's live position against today's personal best.

## Changes

- Replaced the static best-gap copy with first-record, behind, tied, and ahead states.
- Highlighted the ahead state visually so a new record feels earned before the result panel.
- Added a stable restart test id for replay-flow coverage.
- Updated the competition-loop design note.

## QA

- Browser coverage verifies first-record copy on entry and best-gap updates after a replay starts.
