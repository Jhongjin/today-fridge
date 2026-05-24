# Phase 175 Brief - Rating Evidence Packet

## Why

Game rating evidence remains a final Toss review blocker. The project had a checklist, but not a reusable evidence packet shape that the commander can fill and attach to review notes.

## Changed

- Added `scripts/create-game-rating-evidence.mjs`.
- Added `npm run qa:rating-evidence`.
- Updated the QA helper surface guard to cover the new generator.
- Updated game rating and QR session docs, backlog, and decision log.

## Validation

- `node --check scripts/create-game-rating-evidence.mjs`
- `npm run qa:rating-evidence -- --help`
- `git diff --check`
- `npm run qa:rating-evidence -- --print --commit abc123 --path store-self-rating`
- `npm run qa:rating-evidence -- --print --commit abc123 --path grac-certificate`
- `npm run qa:helper-surface -- --json`
- `npm run qa:rating-evidence -- --print --path invalid` (failed as expected)
- `npm run qa:korean-copy --if-present`

## Notes

- This creates evidence templates only. The actual rating evidence still needs owner-supplied store self-rating or GRAC certificate data.
