# Phase 186 Brief

## Queue

Toss requirements screenshot gate alignment.

## Goal

Make the submission requirements and review gates reflect that first-fold and full-flow screenshot evidence is now required in commander review packets.

## Done

- Updated the Toss requirements checkpoint to pair `npm run qa:console-assets` upload PNGs with `npm run qa:screenshots` review evidence.
- Added first-fold/full-flow screenshot regeneration to the current Toss submission gaps.
- Added commander packet screenshot evidence to Gate 4 submission readiness.
- Updated backlog and decision log.

## Verification

- `npm run qa:korean-copy --if-present`
- `npm run qa:helper-surface --if-present`
- `git diff --check`

## Notes

- This is documentation-only and does not change gameplay, runtime gates, or production deploy behavior.
- Production deploy still requires explicit commander approval.
