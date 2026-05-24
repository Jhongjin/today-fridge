# Phase 151 Brief - QR Session Index File Guard

## Why

Phase 149 required QR session index metadata to reference an existing path or HTTPS link. A directory path could still satisfy existence without pointing at actual Markdown evidence.

## Changed

- Local QR session index references now must be existing files, not just existing paths.
- Updated QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>` with a directory QR session index path
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

- HTTPS evidence links remain valid for remote packet evidence.
