# Phase 131 Brief - Console Asset Korean Copy Guard

## Summary

- Extended `scripts/check-korean-copy.mjs` to cover Korean strings in console asset and submission screenshot scripts.
- The guard now checks generated thumbnail copy and the QA Toss bridge submission button label.
- Updated listing copy notes, backlog, and decision log.

## Validation

- `npm run qa:korean-copy` - passed for listing, strategy, HTML, manifest, console asset script, and submission screenshot script.
- `node --check scripts/check-korean-copy.mjs` - passed.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.
- `npm run qa:console-assets` - passed and verified generated PNG dimensions.

## Remaining Risk

- The guard covers the known Korean strings used for metadata, listing, and generated assets. Final upload copy still needs commander review.
