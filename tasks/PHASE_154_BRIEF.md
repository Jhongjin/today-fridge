# Phase 154 Brief - Expected Preview URL Guard

## Why

Commander packets require an HTTPS preview or QR target, but a stale packet could still point at an older target while the commit and Actions run metadata are correct. The checker should be able to compare the target selected by the reviewer.

## Changed

- Added `--expected-preview-url <url>` to `scripts/check-commander-review-packet.mjs`.
- The checker validates expected preview URL shape and fails when packet metadata points at a different target.
- Updated deploy runbook, QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet:check -- --help`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <url> --expected-preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <url> --expected-preview-url https://other.example`
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

- This is a local metadata consistency guard. It does not create or deploy a preview.
