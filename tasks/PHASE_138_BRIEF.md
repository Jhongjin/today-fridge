# Phase 138 Brief - Game Rating Evidence Packet Gate

## Why

Game rating classification evidence is a final Toss submission blocker. The commander packet needed to make that blocker explicit, not just document it in platform notes.

## Changed

- Added a Game Rating Evidence Approval section to generated commander review packets.
- Updated the packet validator to require exactly one rating evidence decision.
- Added rating evidence decision status to the commander review packet index.
- Extended the Korean copy guard to cover rating evidence Korean terms.
- Updated runbook, readiness, requirements, MVP status, backlog, and decision-log docs.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:korean-copy --if-present`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This does not supply legal/store rating evidence. It prevents a packet from being marked ready until the owner-selected evidence path is filled and approved.
