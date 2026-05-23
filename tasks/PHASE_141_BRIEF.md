# Phase 141 Brief - Toss Console Setup Packet Decision

## Why

Console assets were generated and dimension-checked, but final Toss submission also depends on console category, leaderboard settings, bundle upload candidate, QR target, and review state. Those need an explicit commander packet decision.

## Changed

- Added a Toss Console Setup Approval section to generated commander review packets.
- Updated the packet validator to require exactly one console setup decision.
- Added console setup decision status to the commander review packet index.
- Updated runbook, readiness, requirements, screenshot, QR, QA, backlog, and decision-log docs.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:index --if-present`
- `npm run qa:console-assets --if-present`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This does not perform the Apps in Toss console upload. It makes console setup state visible in packet validation and packet indexes.
