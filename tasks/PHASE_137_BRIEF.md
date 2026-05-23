# Phase 137 Brief - Console Asset JSON Output

## Summary

- Added `--json` support to `scripts/capture-console-assets.mjs`.
- JSON mode suppresses dev-server logs and outputs asset readiness, dimensions, byte sizes, and output directory.
- Preserved the existing human-readable table output for CI logs.
- Updated submission screenshot docs, listing copy docs, backlog, and decision log.

## Validation

- `node --check scripts/capture-console-assets.mjs` - passed.
- `npm run qa:console-assets` - passed with the table output.
- `npm run --silent qa:console-assets -- --json` - passed with structured asset output.
- `npm run --silent qa:korean-copy -- --json` - passed.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- JSON output gives automation-friendly evidence only. Final console upload inspection remains manual.
