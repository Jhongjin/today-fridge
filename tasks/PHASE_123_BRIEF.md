# Phase 123 Brief - Dedicated HTTP Error Monitoring Transport

## Summary

- Added optional error-only HTTP monitoring transport behind `VITE_ERROR_MONITORING_ENDPOINT`.
- `reportClientError` still records local analytics events, and now also forwards the resulting event to an optional error-monitoring transport.
- Transport failures are swallowed so monitoring outages never block gameplay.
- Added `src/platform/httpErrorMonitoringTransport.ts` and unit coverage.
- Wired the endpoint during app boot.
- Updated monitoring, analytics, deployment, readiness, runbook, backlog, and decision-log docs.

## Validation

- Targeted monitoring tests: 3 files, 12 tests passed.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- Production monitoring endpoint owner, retention policy, and access controls still need commander approval before final submission.
