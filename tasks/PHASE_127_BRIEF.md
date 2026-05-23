# Phase 127 Brief - Deploy Preflight Optional Monitoring Endpoints

## Summary

- Updated `scripts/check-deploy-prereqs.mjs` to report optional `VITE_ANALYTICS_ENDPOINT` and `VITE_ERROR_MONITORING_ENDPOINT` rows.
- Optional endpoint rows show `configured` or `not_configured` but do not affect strict deploy readiness.
- Updated deploy runbook and Vercel preview setup docs.
- Recorded the queue in backlog and decision log.

## Validation

- `npm run deploy:check-prereqs` - passed and reported optional endpoint rows.
- `npm run deploy:check-prereqs -- --json` - passed with `requiredReady`.
- `npm run deploy:check-prereqs -- --strict` with required Vercel env only - passed while optional endpoints were `not_configured`.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The preflight reports optional endpoints only. Commander approval still decides whether production analytics and monitoring endpoints should be configured.
