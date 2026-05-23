# Phase 95 Brief - Tutorial Board

## Summary

- Added `tutorialBoard` and `tutorialBoardRoute` to `src/game/data/boards.ts`.
- Added `docs/design/TUTORIAL_BOARD.md` with layout, route, scoring expectation, and guardrails.
- Added engine coverage proving the tutorial board teaches match, rescue, and recipe completion in 6 moves with a 1,400 score.
- Updated content validation, tutorial flow notes, backlog, and decision log.

## Validation

- Targeted unit: `npx vitest run src/game/engine/gameEngine.test.ts src/game/data/content.test.ts` - 2 files, 9 tests passed.
- `npm test --if-present` - 26 files, 101 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- The tutorial board is not wired into the live app yet.
- The current live first screen still uses the daily board plus non-blocking hint rail.
