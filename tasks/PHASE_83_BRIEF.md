# Phase 83 Brief - Game User Key Bridge

## Summary

- Added `getUserKeyForGame()` support to the injected Apps in Toss bridge adapter.
- Split the Game Center leaderboard minimum Toss app version (`5.221.0`) from the game user key minimum version (`5.232.0`).
- Mapped `{ type: "HASH", hash }` into `TossClient.getUserKey()` while treating unsupported, invalid-category, error, empty, and thrown cases as unavailable.
- App startup now records `game_user_key_result` and updates shared `user_key_status`.
- QA Toss bridge now emits a fake game user key path for browser and QR-harness rehearsal.

## Validation

- `npm test --if-present` - 20 files, 78 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 207.9 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 45 tests passed across mobile viewports.

## Remaining Risk

- Real official SDK import is still blocked by local package install timeouts.
- Real Toss QR validation is still required for `getUserKeyForGame()` success, invalid-category, error, and unsupported-version paths.
