# Phase 86 Brief - Game User Key Leaderboard Gate

## Summary

- Clean leaderboard submit now requires `TossClient.getUserKey()` to return a game user key.
- Missing game user key returns `GAME_USER_KEY_UNAVAILABLE` and skips the platform score submit call.
- Result-screen copy now distinguishes this profile/user-key skip from clean-ranked fairness skips.
- QA Toss bridge gained `?qa=toss-bridge-no-user-key` to rehearse the no-user-key path.
- Platform, analytics, QR, Toss adapter, backlog, and decision docs now reflect the guard.

## Validation

- Targeted unit: `npx vitest run src/platform/leaderboard.test.ts src/platform/qaTossBridge.test.ts` - 11 tests passed.
- Targeted browser: `npx playwright test tests/playwright/first-screen.spec.ts -g "game user key"` - 3 tests passed.
- `npm test --if-present` - 20 files, 80 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Real Toss profile WebView creation is still pending until the official SDK package import/QR runtime is available.
- Real devices must confirm that supported Toss app versions provide the game user key before score submission.
