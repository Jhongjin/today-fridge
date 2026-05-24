# Phase 142 Brief - Real Device QR Packet Decision

## Why

Real Apps in Toss QR/device validation is the central final-review blocker. The commander packet already referenced QR sessions, but the QR approval state needed its own decision field.

## Changed

- Added a Real Device QR Approval section to generated commander review packets.
- Updated the packet validator to require exactly one QR decision.
- Added QR decision status to the commander review packet index.
- Updated QR, readiness, requirements, QA, backlog, and decision-log docs.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:index --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This does not replace physical Toss app testing. It makes the QR approval, follow-up, or blocker state visible in packet validation and packet indexes.
