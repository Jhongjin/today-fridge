# Phase 176 Brief - Rating Evidence Checker

## Why

The rating evidence generator creates a reusable packet, but final Toss review needs a filled packet with no TODOs, exactly one evidence path, and exactly one commander rating decision. A checker makes that gate enforceable before commander approval.

## Changed

- Added `scripts/check-game-rating-evidence.mjs`.
- Added `npm run qa:rating-evidence:check`.
- Added the rating evidence checker to the QA helper surface guard.
- Added `npm run qa:rating-evidence:check` to commander review packet required commands.
- Updated rating evidence, commander runbook, QR harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-game-rating-evidence.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/create-commander-review-packet.mjs`
- `git diff --check`
- `npm run qa:rating-evidence:check -- --help`
- `npm run qa:helper-surface -- --json`
- `npm run qa:rating-evidence:check -- --github-summary` (failed as expected with no evidence files, summary written)
- Filled temp store self-rating sample passed `npm run qa:rating-evidence:check -- <file> --json`
- Generated commander packet includes `npm run qa:rating-evidence:check`
- `npm run qa:korean-copy --if-present`

## Notes

- The checker supports `--json`, `--github-summary`, `--dir`, and direct file/directory arguments.
