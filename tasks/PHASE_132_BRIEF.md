# Phase 132 Brief - Commander Packet Console Assets

## Summary

- Added `npm run qa:console-assets` to commander review packet required local commands.
- Updated packet validation so saved packets must include console asset generation before approval.
- Added an evidence checklist item for regenerated logo, thumbnail, and upload screenshot dimension verification.
- Updated deployment runbook, submission screenshot docs, backlog, and decision log.

## Validation

- Packet print includes `npm run qa:console-assets`.
- Validator sample packet with the console asset command - passed.
- `npm run qa:korean-copy` - passed.
- `npm run qa:console-assets` - passed and verified generated PNG dimensions.
- `npm test --if-present` - 34 files, 136 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The packet now requires local asset generation, but final console upload and real QR evidence remain commander-owned.
