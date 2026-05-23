# Phase 118 Brief - Commander Packet SDK Triage Gate

## Summary

- Updated the commander QR review packet template to require:
  - `npm run sdk:dependency-triage -- --strict`
- Added an evidence checklist item confirming SDK dependency triage was refreshed for the reviewed commit and has no strict failures.
- Updated the commander deploy runbook, backlog, and decision log to reflect the new approval gate.

## Validation

- Packet print: `npm run qa:commander-review-packet -- --print --commit 4138692 --preview-url https://preview.example` - includes SDK triage command and checklist item.
- External reward packet print: `npm run qa:commander-review-packet -- --print --commit 4138692 --preview-url https://preview.example --external-rewards` - includes SDK triage command and external reward section.
- `npm run sdk:dependency-triage -- --strict` - passed.
- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The packet still depends on humans linking and reviewing actual QR/device evidence.
- The SDK triage command reports known audit findings; it does not approve or fix them automatically.
