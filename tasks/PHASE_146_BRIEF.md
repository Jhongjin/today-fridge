# Phase 146 Brief - Queue Preview Run URL Shape Guard

## Why

Phase 145 made the Queue Preview run URL required, but the checker only required a non-pending value. The field should point to a real GitHub Actions run page so review evidence is clickable and auditable.

## Changed

- Added GitHub Actions run URL shape validation to the commander review packet checker.
- Updated the deploy runbook and QR session harness docs with the expected URL format.
- Updated backlog and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>` with an invalid run URL
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

- The guard validates URL shape only. GitHub Actions completion is still confirmed separately in the queue protocol.
