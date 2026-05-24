# Phase 169 Brief - Evidence Index Summaries

## Why

QR session and commander packet indexes already render review-ready Markdown, but automation had to expose them through logs or files. GitHub summaries are a natural place for those index tables when evidence checks run in Actions.

## Changed

- Added `--github-summary` to `scripts/build-qr-session-index.mjs`.
- Added `--github-summary` to `scripts/build-commander-review-index.mjs`.
- Updated QR harness and commander runbook notes, backlog, and decision log.

## Validation

- `node --check scripts/build-qr-session-index.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `git diff --check`
- `npm run qa:qr-session:index -- --help`
- `npm run qa:commander-review-packet:index -- --help`
- `npm run qa:qr-session:index -- --github-summary`
- `npm run qa:commander-review-packet:index -- --github-summary`

## Notes

- The existing `--json`, `--output`, and `--strict` behavior is unchanged.
