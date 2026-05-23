# Phase 140 Brief - SDK Dependency Packet Decision

## Why

The commander packet already required `npm run sdk:dependency-triage -- --strict`, but the command reports known SDK/audit findings instead of approving them. Final review needs the commander decision captured alongside the refreshed evidence.

## Changed

- Added an SDK Dependency Approval section to generated commander review packets.
- Updated the packet validator to require exactly one SDK dependency decision.
- Added SDK dependency decision status to the commander review packet index.
- Updated SDK, readiness, runbook, requirements, backlog, and decision-log docs.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:index --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This does not resolve SDK transitive audit findings. It prevents a final packet from being marked ready until the commander records proceed, follow-up, or blocked.
