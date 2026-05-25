# Phase 185 Brief

## Queue

Commander packet submission screenshot gate.

## Goal

Require first-fold and full-flow submission screenshot evidence in commander review packets before final approval.

## Done

- Added `npm run qa:screenshots` to generated commander review packet required local commands.
- Added `npm run qa:screenshots` to commander review packet validation.
- Added a checklist row requiring regenerated submission screenshots, including `00-first-viewport.png`.
- Updated screenshot docs, commander runbook, submission readiness, backlog, and decision log.

## Verification

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- Generated packet contains `npm run qa:screenshots` and the `00-first-viewport.png` checklist row.
- Checker rejects a packet with `npm run qa:screenshots` removed.
- `npm run qa:helper-surface --if-present`
- `npm run qa:korean-copy --if-present`
- `git diff --check`

## Notes

- This does not require committing generated PNG artifacts.
- Production deploy still requires explicit commander approval.
