# Phase 106 Brief - External Reward SDK Adapters

## Summary

- Added `tossContactsViralClient` to normalize real `contactsViral` reward, close, no-reward, missing-module, timeout, and error states.
- Added `tossRewardedAdClient` to normalize real `loadFullScreenAd` and `showFullScreenAd` events into the existing `RewardedAdClient` contract.
- Added `tossPromotionRewardClient` to normalize real `grantPromotionRewardForGame` success, unsupported, `"ERROR"`, error-code, and invalid local request states.
- Updated SDK queue, API map, QA harness, external reward policy, and decision log.

## Validation

- Targeted unit: `npm test -- --run src/platform/tossRewardedAdClient.test.ts src/platform/tossContactsViralClient.test.ts src/platform/tossPromotionRewardClient.test.ts` - 3 files, 9 tests passed.
- Unit suite: `npm test --if-present` - 31 files, 124 tests passed.
- Build: `npm run build --if-present` - passed.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed across mobile viewports.

## Remaining Risk

- The adapters are not exposed in UI yet.
- QR/device testing still needs to confirm real Apps in Toss event timing, cleanup behavior, and error payloads before commander-approved runtime wiring.
