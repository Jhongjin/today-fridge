# Phase 100 Brief - Typed Toss Submit Error Codes

## Summary

- Added a fixed `TOSS_CLIENT_ERROR_CODES` list and `TossClientErrorCode` union for leaderboard submit failures.
- Normalized unknown Apps in Toss SDK submit status codes to `TOSS_LEADERBOARD_SUBMIT_FAILED`.
- Updated leaderboard service typing so submit failures no longer expose arbitrary error strings.
- Added unit coverage for the code list, normalization helper, adapter normalization, and retry behavior.
- Updated SDK adapter, API map, platform adapter, QR test plan, queue, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/tossClient.test.ts src/platform/appsInTossClient.test.ts src/platform/tossRealClient.test.ts src/platform/leaderboard.test.ts` - 4 files, 17 tests passed.
- `npm test --if-present` - 28 files, 108 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.6 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- The allowed official status-code set still needs QR/device confirmation against the real Toss runtime.
- Runtime selection remains QA bridge or local mock until commander approves real SDK runtime activation.
