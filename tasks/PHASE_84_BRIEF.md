# Phase 84 Brief - QR Session Evidence Harness

## Summary

- Added `npm run qa:qr-session` to generate one Markdown evidence file per physical QR-device run.
- Added `docs/platform/QR_SESSION_HARNESS.md` with the session protocol, flags, required device matrix, and evidence rules.
- Expanded `docs/platform/QR_TEST_PLAN.md` with version gates, required artifacts, user-key checks, and commander pass criteria.
- Updated platform readiness, Toss QA harness, requirements checkpoint, backlog, and decision log.

## Validation

- `npm run qa:qr-session -- --platform android --device "Pixel 8" --toss-version 5.232.0 --mode supported --preview-url https://preview.example --commit 4026818 --print > $null` - passed.
- `npm test --if-present` - 20 files, 78 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 207.9 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 45 tests passed across mobile viewports.

## Remaining Risk

- The session harness does not replace real Apps in Toss QR testing.
- Preview deploy is still skipped until `AUTO_DEPLOY_ENABLED` and Vercel secrets are configured.
