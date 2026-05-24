# Phase 155 Brief - Expected QR Session Index Guard

## Why

Commander packet checks now compare expected commit, Actions run, and preview target metadata. The QR session index is the remaining evidence pointer, so stale or mismatched QR evidence should be caught the same way.

## Changed

- Added `--expected-session-index <path-or-url>` to `scripts/check-commander-review-packet.mjs`.
- The checker validates the expected QR session index as an HTTPS URL or existing local file and fails when packet metadata points elsewhere.
- Updated deploy runbook, QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet:check -- --help`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <url> --expected-preview-url https://preview.example --expected-session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha> --expected-actions-run-url <url> --expected-preview-url https://preview.example --expected-session-index <different-url>`
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

- This guard compares the evidence reference selected by the reviewer. It does not create QR evidence.
