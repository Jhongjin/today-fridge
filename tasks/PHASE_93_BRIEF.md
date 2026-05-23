# Phase 93 Brief - External Reward QA Scenarios

## Summary

- Added `src/platform/externalRewardScenarios.ts` as an integrated QA runner for share, rewarded-ad, and promotion mock rewards.
- The runner allows only fixed non-ranked rewards into the wallet and reports blocked policy reasons for active-play ads, score, rank, win/loss, random, and non-user-initiated promotion paths.
- Added unit coverage for wallet safety, clean ranked score delta, expected block reasons, and analytics evidence events.
- Updated reward policy docs, Toss QA harness, MVP status, submission readiness, review gates, SDK queue, backlog, and decision log.

## Validation

- Targeted unit: `npx vitest run src/platform/externalRewardScenarios.test.ts` - 2 tests passed.
- `npm test --if-present` - 26 files, 100 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- The runner covers mock service policy behavior only.
- Real Toss share, ad, and promotion SDK event payloads still need QR/device verification before the UI exposes these rewards.
