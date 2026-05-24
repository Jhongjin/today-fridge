# Phase 156 Brief - QR Evidence Helper Help

## Why

QR evidence operators now need to pass several exact metadata and validation flags. The commander packet helpers had help output, but the QR session and index helpers still required reading source or docs to discover the current CLI surface.

## Changed

- Added `--help` output to `scripts/create-qr-session.mjs`.
- Added `--help` output to `scripts/check-qr-session-evidence.mjs`.
- Added `--help` output to `scripts/build-qr-session-index.mjs`.
- Added `--help` output to `scripts/build-commander-review-index.mjs`.
- Updated QR session harness docs, commander deploy runbook, backlog, and decision log.

## Validation

- `node --check scripts/create-qr-session.mjs`
- `node --check scripts/check-qr-session-evidence.mjs`
- `node --check scripts/build-qr-session-index.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:qr-session -- --help`
- `npm run qa:qr-session:check -- --help`
- `npm run qa:qr-session:index -- --help`
- `npm run qa:commander-review-packet:index -- --help`
- `npm run qa:qr-session:index --if-present`
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

- This is an operator-facing help improvement only. It does not change QR evidence validation rules.
