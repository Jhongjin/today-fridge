# Phase 119 Brief - Commander Packet Commit Default

## Summary

- Updated `scripts/create-commander-review-packet.mjs` so `--commit` defaults to the current short Git SHA.
- Preserved explicit `--commit` override behavior.
- Documented the default in the commander deploy runbook.
- Recorded the queue in backlog and decision log.

## Validation

- Packet print without `--commit` - commit field defaulted to current `git rev-parse --short HEAD`.
- Packet print with `--commit manual-sha` - commit field used `manual-sha`.
- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The packet still needs to be generated after the intended review commit is checked out locally.
