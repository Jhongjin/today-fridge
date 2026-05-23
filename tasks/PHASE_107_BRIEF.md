# Phase 107 Brief - External Reward Runtime Gate

## Summary

- Added `externalRewardRuntimeGate` so real contacts/ad/promotion rewards require `VITE_TOSS_REAL_EXTERNAL_REWARDS=true`.
- The gate also requires `VITE_TOSS_REAL_CLIENT=true` and all Toss console IDs before returning `mode: "real"`.
- Missing IDs return `mode: "blocked"` with explicit missing key names.
- Updated Vite env typing, deployment pipeline notes, QR test plan, SDK queue, and decision log.

## Validation

- Targeted unit: `npm test -- --run src/platform/externalRewardRuntimeGate.test.ts` - 1 file, 4 tests passed.
- Unit suite: `npm test --if-present` - 32 files, 128 tests passed.
- Build: `npm run build --if-present` - passed.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed across mobile viewports.

## Remaining Risk

- The gate is not wired into UI runtime selection yet.
- Real external rewards still need commander-approved QR/device evidence before any UI path uses the SDK adapters.
