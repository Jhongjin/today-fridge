# Phase 130 Brief - Queue Preview Korean Copy Guard

## Summary

- Added `Check Korean copy` to the Queue Preview `Validate Harness` job.
- The remote harness now runs `npm run qa:korean-copy --if-present` before production build and browser checks.
- Updated deployment and preview setup docs to list the Korean copy guard as part of validation.
- Recorded the queue in backlog and decision log.

## Validation

- `npm run qa:korean-copy --if-present` - passed.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- CI now blocks known Korean copy encoding regressions. Commander still owns final review copy approval.
