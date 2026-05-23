# Phase 91 Brief - Rewarded Ad Mock Service

## Summary

- Added `src/platform/rewardedAd.ts` to model future rewarded-ad completion rewards.
- The service requires user initiation, ad completion evidence, non-active-play placement, fixed non-ranked reward policy, and duplicate protection through the external grant harness.
- Added unit coverage for success, missing completion event, and active-play interruption block.
- Updated external reward policy docs, SDK API map, Toss QA harness, SDK queue, backlog, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/rewardedAd.test.ts` - 3 tests passed.
- `npm test --if-present` - 24 files, 96 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Real rewarded ad SDK loading/showing is not implemented.
- Audio pause/resume and QR-device behavior still need verification when real ads are connected.
