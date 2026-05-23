# Phase 133 Brief - Queue Preview Console Assets

## Summary

- Added console asset capture to Queue Preview `Validate Harness` after Playwright Chromium installation.
- CI now runs `npm run qa:console-assets --if-present` before browser tests, regenerating upload assets and checking PNG dimensions.
- Updated deployment pipeline and preview setup docs.
- Recorded the queue in backlog and decision log.

## Validation

- `npm run qa:console-assets --if-present` - passed and verified generated PNG dimensions.
- `npm run qa:korean-copy --if-present` - passed.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- Remote CI now verifies generated asset dimensions, but final console upload and QR-device screenshots remain commander-owned.
