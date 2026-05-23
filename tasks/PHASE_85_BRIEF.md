# Phase 85 Brief - Vercel Preview Deploy Prerequisites

## Summary

- Added `npm run deploy:check-prereqs` to report whether preview deployment prerequisites are present without printing secret values.
- Added strict and JSON output modes for local or CI preflight use.
- Added `docs/platform/VERCEL_PREVIEW_SETUP.md` with the exact GitHub variable/secrets, setup path, verification criteria, and commander production boundary.
- Updated deployment pipeline, commander runbook, submission readiness, backlog, and decision log.
- Added `.vercel/` to `.gitignore` so local Vercel project metadata is not accidentally committed.

## Validation

- `npm run deploy:check-prereqs` - reports current state as not ready.
- `npm run deploy:check-prereqs -- --strict` - exits non-zero when prerequisites are missing.
- `npm run deploy:check-prereqs -- --json` - returns machine-readable readiness.
- `npm test --if-present` - 20 files, 78 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 207.9 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 45 tests passed across mobile viewports.

## Remaining Risk

- Actual preview deployment still requires GitHub repository variable `AUTO_DEPLOY_ENABLED=true` and secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Production remains manual through commander approval.
