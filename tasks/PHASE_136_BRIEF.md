# Phase 136 Brief - Korean Copy JSON Output

## Summary

- Added `--json` support to `scripts/check-korean-copy.mjs`.
- JSON output includes overall readiness, per-file status, and issue lists for automation evidence.
- Preserved the existing human-readable table output.
- Updated listing copy notes, backlog, and decision log.

## Validation

- `node --check scripts/check-korean-copy.mjs` - passed.
- `npm run qa:korean-copy` - passed with the existing table output.
- `npm run qa:korean-copy -- --json` - passed with structured readiness output.
- `npm run qa:console-assets --if-present` - passed and printed the verification table.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- JSON output reports guard results only. Commander approval still owns final production copy wording.
