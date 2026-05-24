# Phase 149 Brief - QR Session Index Reference Guard

## Why

Commander packets require a QR session index, but the checker accepted any non-pending value. Final QR approval should not pass with a placeholder path that does not exist.

## Changed

- Updated the commander review packet checker to require `QR session index` metadata to be either an HTTPS URL or an existing local file.
- Updated deploy and QR session harness docs.
- Updated backlog and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>` with a missing local QR session index path
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

- This does not create QR evidence. It prevents final packet approval from pretending missing QR session index evidence is present.
