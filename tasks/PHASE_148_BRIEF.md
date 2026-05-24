# Phase 148 Brief - Preview URL Shape Guard

## Why

Commander packets require a preview URL, but the checker accepted any non-pending string. Final review evidence should point to a clickable HTTPS preview or QR target.

## Changed

- Added HTTPS URL validation for `Preview URL` metadata in the commander review packet checker.
- Updated deploy and QR packet docs with the URL requirement.
- Updated backlog and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>` with an invalid preview URL
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

- This does not deploy anything. It only prevents placeholder text from passing packet approval checks.
