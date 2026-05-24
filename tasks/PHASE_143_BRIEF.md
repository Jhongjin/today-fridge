# Phase 143 Brief - Preview Deploy Packet Decision

## Why

Queue Preview can currently validate successfully while the optional Vercel preview deployment is skipped because repository variables or secrets are not configured. That state needs to be explicit in commander review packets instead of living only in workflow logs.

## Changed

- Added a Preview Deploy Approval section to generated commander review packets.
- Updated the packet validator to require exactly one preview deploy decision.
- Added preview deploy decision status to the commander review packet index.
- Updated deploy, QR, readiness, requirements, QA, backlog, and decision-log docs.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `node --check scripts/build-commander-review-index.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example`
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

- This does not enable production deploy. It only records whether preview deploy evidence is approved, intentionally skipped, or blocked before final review.
