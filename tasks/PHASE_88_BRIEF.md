# Phase 88 Brief - External Reward Policy Guard

## Summary

- Added `src/platform/externalRewardPolicy.ts` to evaluate future share reward, rewarded ad, and promotion point grants.
- Locked block reasons for score, rank, win/loss, random, non-fixed, non-user-initiated, clean-ranked-affecting, and active-play ad cases.
- Added unit coverage for allowed fixed rewards and all current block reasons.
- Added `docs/platform/EXTERNAL_REWARD_POLICY.md` and linked it from Toss QA, SDK API map, readiness, MVP status, backlog, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/externalRewardPolicy.test.ts` - 9 tests passed.
- `npm test --if-present` - 21 files, 89 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Share reward, rewarded ad, and promotion SDK integrations are still not implemented.
- Future integration code must call the policy guard before granting any external reward.
