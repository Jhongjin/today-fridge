# Phase 68 Brief

## Queue

Score tier engine helper.

## Commander Intent

Score tier thresholds are balance rules, not UI decoration. Moving them into a pure engine helper keeps future score tuning straightforward and testable.

## Changes

- Added `src/game/engine/scoreTier.ts`.
- Added focused tier threshold tests.
- Updated the app to consume the helper.
- Recorded the queue in the backlog and decision log.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
