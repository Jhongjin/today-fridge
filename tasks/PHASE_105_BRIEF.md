# Phase 105 Brief - Ad And Promotion Safe Hooks

## Summary

- Added a rewarded-ad client boundary with mock `load` and `show` steps before any fixed reward grant.
- Added rewarded-ad reward ID helpers, daily claimed checks, and a fixed failure reward constant.
- Added promotion reward ID helpers and `claimFixedPromotionActionReward()` for fixed attendance/event-style actions.
- Kept both systems routed through `externalRewardPolicy` and `externalRewardGrant`.
- Updated SDK queue, QA harness, API map, analytics implementation notes, external reward policy, and decision log.

## Validation

- Targeted unit: `npm test -- --run src/platform/rewardedAd.test.ts src/platform/promotionReward.test.ts` - 2 files, 9 tests passed.
- Unit suite: `npm test --if-present` - 28 files, 115 tests passed.
- Build: `npm run build --if-present` - passed.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed across mobile viewports.

## Remaining Risk

- Real Toss rewarded-ad and promotion SDK adapters are still pending official QR/device verification.
- No ad or promotion UI is exposed yet; this phase locks the platform hooks first.
