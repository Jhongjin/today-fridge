# Phase 113 Brief - Commander QR Review Packet

## Summary

- Added `scripts/create-commander-review-packet.mjs` to generate a one-file commander QR approval packet.
- Added `npm run qa:commander-review-packet`.
- The packet covers reviewed commit, preview URL, QR session index, required local commands, evidence checks, platform decision checks, and commander decision.
- Added an optional `--external-rewards` section for real contacts/ad/promotion approval without enabling UI wiring.
- Updated QR session, QR test, commander deploy runbook, submission readiness, backlog, and decision-log docs.

## Validation

- Packet print: `node scripts/create-commander-review-packet.mjs --print --commit 0594096 --preview-url https://preview.example` - passed.
- External reward packet print: `node scripts/create-commander-review-packet.mjs --print --commit 0594096 --preview-url https://preview.example --external-rewards` - passed.
- NPM alias: `npm run qa:commander-review-packet -- --print --commit 0594096 --preview-url https://preview.example` - passed.
- Output write: `node scripts/create-commander-review-packet.mjs --commit 0594096 --preview-url https://preview.example --external-rewards --output <temp>/packet.md` - passed.
- Unit suite: `npm test --if-present` - 33 files, 131 tests passed.
- Build: `npm run build --if-present` - passed, including external reward preflight no-op path.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The packet is an approval artifact template. It does not replace real QR/device testing or commander review of linked evidence.
