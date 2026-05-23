# Phase 101 Brief - Real Toss Runtime Opt-In

## Summary

- Added `VITE_TOSS_REAL_CLIENT=true` as an explicit real SDK runtime switch for QR-candidate builds.
- Kept the injected QA bridge ahead of the real SDK flag so browser automation and failure rehearsals remain deterministic.
- Lazy-loaded `createTossRealClient()` only when the flag is enabled, keeping default browser/CI builds on the local mock path.
- Made the deferred real client fail closed and retry a future load if the SDK runtime cannot load.
- Updated SDK adapter, API map, QA harness, QR test plan, deployment pipeline notes, queue, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/runtimeTossClient.test.ts src/platform/tossRealClient.test.ts src/platform/appsInTossClient.test.ts` - 3 files, 14 tests passed.
- `npm test --if-present` - 28 files, 111 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 222.3 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.
- `VITE_TOSS_REAL_CLIENT=true npm run build --if-present` - passed.
- `npm run check:bundle --if-present` after the real-client build - 222.3 KB / 5120.0 KB budget.

## Remaining Risk

- A real Apps in Toss QR preview with `VITE_TOSS_REAL_CLIENT=true` still needs Android/iOS device evidence.
- Commander approval is still required before making the real SDK path the default runtime.
