# Phase 144 Brief - Commander Packet Expected Commit Guard

## Why

Commander packets already record a commit SHA, but the checker did not compare it to the commit being approved. A stale packet could therefore pass completeness checks while pointing at an older Queue Preview run.

## Changed

- Added `--expected-commit <sha>` to `npm run qa:commander-review-packet:check`.
- The checker now accepts matching short or full SHA prefixes and fails on mismatches.
- Updated the deploy runbook, QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit deadbeef`
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

- This does not verify GitHub Actions by itself. It makes the local packet check fail unless the reviewer supplies the expected Queue Preview commit.
