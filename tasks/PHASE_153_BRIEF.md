# Phase 153 Brief - Expected Queue Preview Run Guard

## Why

Commander packets now require a Queue Preview run URL, but the checker could only validate URL shape. A stale packet could still point at a different successful run unless the reviewer manually compared it.

## Changed

- Added `--expected-actions-run-url <url>` to `scripts/check-commander-review-packet.mjs`.
- The checker now validates the expected run URL shape and fails when packet metadata points at a different Actions run.
- Updated deploy runbook, QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet:check -- --help`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <different-url>`
- `npm run qa:commander-review-packet:index --if-present`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This still does not call GitHub APIs. It ensures the local packet check compares against the Actions run URL chosen by the reviewer.
