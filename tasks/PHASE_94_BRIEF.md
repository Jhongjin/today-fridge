# Phase 94 Brief - Promotion Review Requirements

## Summary

- Added `docs/platform/PROMOTION_REVIEW_REQUIREMENTS.md` from official Apps in Toss promotion docs checked on 2026-05-23.
- Locked Today Fridge rules for fixed action-only promotion rewards, no score/rank/win-loss/random grants, distinct Toss point wording, budget limits, duplicate prevention, and QA requirements.
- Added an error-handling matrix for `undefined`, `ERROR`, `40000`, `4100`, `4109`, `4110`, `4111`, `4112`, `4114`, and `4116`.
- Linked the requirements from Toss QA, submission readiness, SDK API map, backlog, and decision log.

## Validation

- `npm test --if-present` - 26 files, 100 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- The requirements are documentation and harness policy only.
- Real campaign setup, console review, test-code call, and QR/device verification remain pending.
