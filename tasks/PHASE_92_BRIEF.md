# Phase 92 Brief - Promotion Reward Mock Service

## Summary

- Added `src/platform/promotionReward.ts` to model future `grantPromotionRewardForGame` rewards.
- The service grants through `externalRewardGrant`, requires fixed user-initiated action rewards, prevents duplicate reward IDs, and emits `promotion_reward`.
- Added unit coverage for successful first-launch promotion grants and score-tied policy blocking.
- Updated analytics schema, external reward policy docs, SDK API map, Toss QA harness, SDK queue, backlog, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/promotionReward.test.ts` - 2 tests passed.
- `npm test --if-present` - 25 files, 98 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Real `grantPromotionRewardForGame` SDK wiring is not implemented yet.
- Promotion budget, console campaign limits, and QR-device result codes still need verification when real Toss promotion points are connected.
