# Phase 135 Brief - Commander Packet Index Command Gate

## Summary

- Added required-command readiness to commander review packet index rows.
- The index now shows `Required Commands` as `ready` or `missing <count>` for each saved packet.
- JSON output now includes `requiredCommands` and `missingRequiredCommands` for automation.
- Updated the deploy runbook, backlog, and decision log.

## Validation

- `node --check scripts/build-commander-review-index.mjs` - passed.
- Temporary ready packet: `npm run qa:commander-review-packet:index -- <temp-dir> --strict` - passed and printed `Required Commands | ready`.
- `npm run qa:korean-copy --if-present` - passed.
- `npm run qa:console-assets --if-present` - passed and printed the verification table.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The index summarizes command presence, not whether a human actually ran each command. Packet approval still requires commander review.
