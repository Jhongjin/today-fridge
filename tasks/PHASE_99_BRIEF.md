# Phase 99 Brief - Toss Real Client Wrapper

## Summary

- Added `src/platform/tossRealClient.ts` to import official Apps in Toss SDK Game Center functions from `@apps-in-toss/web-framework`.
- The wrapper reuses `createAppsInTossClient`, so official SDK, QA bridge, and tests share the same normalization rules.
- Tightened the minimum-version type to match official SDK version-string constraints.
- Added unit coverage with a mocked official SDK boundary for user key, leaderboard submit/open, and unsupported-version gating.
- Updated SDK adapter docs, SDK API map, SDK queue, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/tossRealClient.test.ts src/platform/appsInTossClient.test.ts` - 2 files, 8 tests passed.
- `npm test --if-present` - 27 files, 105 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Runtime selection still uses the injected bridge or local mock client.
- QR/device testing must approve switching runtime selection to the official SDK client.
