# Phase 108 Brief - Runtime External Reward Clients

## Summary

- Added `createRuntimeExternalRewardClients()` as the future UI entry point for contacts viral, rewarded ads, and promotion grants.
- The factory returns mock rewarded-ad clients while the external reward gate is `mock` or `blocked`.
- Real contacts/ad/promotion SDK adapters are lazy-loaded only when the gate is `real`.
- Promotion grants are bound to the configured QR-candidate promotion code.
- Updated SDK queue, QR test plan, external reward policy, and decision log.

## Validation

- Targeted unit: `npm test -- --run src/platform/runtimeExternalRewardClients.test.ts` - 1 file, 3 tests passed.
- Unit suite: `npm test --if-present` - 33 files, 131 tests passed.
- Build: `npm run build --if-present` - passed.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed across mobile viewports.

## Remaining Risk

- UI wiring still intentionally uses mock/local paths until commander-approved QR/device evidence is collected.
