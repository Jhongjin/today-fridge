# Phase 121 Brief - Commander Packet Completeness Validator

## Summary

- Added `scripts/check-commander-review-packet.mjs`.
- Added `npm run qa:commander-review-packet:check`.
- The validator checks:
  - required packet sections and local commands,
  - commit, preview URL, QR session index, and clean worktree metadata,
  - no `TODO`,
  - all non-decision checklist items checked,
  - exactly one commander decision,
  - exactly one external reward decision when the external reward section exists.
- Added runbook instructions for validating filled review packets.

## Validation

- Incomplete generated packet via stdin - failed as expected.
- Filled normal packet via stdin - passed.
- Filled external reward packet via stdin - passed.
- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The validator checks packet completeness, not whether linked QR/device artifacts are truthful or sufficient.
