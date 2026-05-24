# Phase 145 Brief - Queue Preview Run Metadata

## Why

The commander packet checklist asked reviewers to record the successful Queue Preview run, but it was not a structured metadata field. That made the Actions evidence easy to omit or hard to scan in packet indexes.

## Changed

- Added `--actions-run-url <url>` to generated commander review packets.
- Added required `Queue Preview run` metadata validation to the packet checker.
- Added the Queue Preview run URL to the commander review packet index.
- Updated deploy and QR packet docs, backlog, and decision log.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
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

- This does not call GitHub APIs. It makes the successful Actions run URL required evidence in the local review packet.
