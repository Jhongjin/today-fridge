# Phase 109 Brief - External Reward QR Preflight

## Summary

- Added `scripts/check-external-reward-prereqs.mjs` to report real external reward QR build readiness without printing secret values.
- Wired the preflight into `npm run build`, so normal mock/CI builds pass, but builds with `VITE_TOSS_REAL_EXTERNAL_REWARDS=true` fail before Vite starts when required env is missing.
- Added explicit QR commands:
  - `npm run external-rewards:check-prereqs`
  - `npm run qr:external-rewards:preflight`
  - `npm run qr:external-rewards:build`
- Updated QR, deployment, runbook, backlog, SDK queue, and decision-log docs.

## Validation

- Preflight default: `npm run external-rewards:check-prereqs` - passed with `not_requested`.
- QR preflight without real env: `npm run qr:external-rewards:preflight` - failed as expected with `REAL_EXTERNAL_REWARDS_REQUIRED`.
- Real flag without required env: `VITE_TOSS_REAL_EXTERNAL_REWARDS=true npm run external-rewards:check-prereqs` - failed as expected with missing key report.
- Complete real QR env: `npm run qr:external-rewards:preflight` - passed with all required keys marked ready.
- Complete real QR build: `npm run qr:external-rewards:build` - passed with dummy QR env values.
- Targeted unit: `npm test -- --run src/platform/externalRewardRuntimeGate.test.ts src/platform/runtimeExternalRewardClients.test.ts` - 2 files, 7 tests passed.
- Unit suite: `npm test --if-present` - 33 files, 131 tests passed.
- Build: `npm run build --if-present` - passed, including preflight no-op path.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- Real contacts/ad/promotion UI wiring remains intentionally deferred until commander-approved QR/device evidence is collected.
