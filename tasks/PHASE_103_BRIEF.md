# Phase 103 Brief - Leaderboard Action Flow Lock

## Summary

- Added browser coverage proving leaderboard submit and leaderboard open are separate result-screen actions.
- The QA bridge now asserts no submit/open event before the result actions are tapped.
- After one clean submit, the submit button disables and the bridge records exactly one submit event.
- Leaderboard open remains a separate user tap and records exactly one open event.
- Updated leaderboard open docs, SDK queue, and decision log.

## Validation

- Targeted browser: `npx playwright test tests/playwright/first-screen.spec.ts --project mobile-390 --grep "keeps leaderboard open separate"` - 1 test passed.
- `npm test --if-present` - 28 files, 111 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 224.0 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 51 tests passed across mobile viewports.

## Remaining Risk

- Real Apps in Toss QR testing still needs to confirm the native leaderboard WebView opens and returns without resetting game state.
