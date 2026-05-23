# Phase 87 Brief - Toss SDK API Map

## Summary

- Added `docs/platform/TOSS_SDK_API_MAP.md` as the command-center map for official Apps in Toss SDK surfaces.
- Mapped game profile, game user key, leaderboard submit/open, contacts viral, reward events, full-screen ads, banner ads, game promotion points, and app review.
- Marked current implementation status and Today Fridge policy rules for each API.
- Updated SDK adapter, submission readiness, SDK queue, backlog, and decision log to reference the map.

## Validation

- `npm test --if-present` - 20 files, 80 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Official SDK package installation is still blocked locally.
- Real QR validation is still required for the mapped APIs before implementation can be considered production-ready.
