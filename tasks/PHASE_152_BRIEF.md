# Phase 152 Brief - Commander Packet Generator Help

## Why

Commander review packet generation gained several required metadata fields across Phases 144-151. The generator did not have a help screen, and command examples could omit the QR session index evidence argument.

## Changed

- Added `--help` output to `scripts/create-commander-review-packet.mjs`.
- Listed commit, Queue Preview run URL, preview/QR URL, QR session index, output, print, and external reward options.
- Updated deploy runbook and QR session harness command examples to include `--session-index`.
- Updated backlog and decision log.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --help`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example --session-index <https-url>`
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

- This is a usability/documentation guard. It does not create QR evidence or run production deploy.
