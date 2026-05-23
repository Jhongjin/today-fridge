# Phase 128 Brief - Korean Copy Encoding Guard

## Summary

- Added `scripts/check-korean-copy.mjs` to verify required Korean listing, strategy, HTML, and manifest phrases.
- Added known mojibake marker detection so review/QR packets catch broken Korean copy early.
- Added `npm run qa:korean-copy` and documented it in the Toss listing copy notes.
- Recorded the queue in backlog and decision log.

## Validation

- `npm run qa:korean-copy` - passed for listing copy, strategy lock, `index.html`, and web manifest.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The guard checks fixed required phrases and known mojibake markers. Commander approval still owns the final production copy wording.
