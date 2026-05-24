# Phase 167 Brief - External Reward Packet Command

## Why

Phase 166 made external reward prerequisite state visible in Queue Preview summaries. Commander review packets should require the same local evidence so QR/review approval cannot skip over whether real external rewards were off, ready, or blocked by missing Toss console values.

## Changed

- Added `npm run external-rewards:check-prereqs` to generated commander review packet required commands.
- Updated the commander packet checker to require that command in filled packets.
- Added an evidence checklist row for external reward prerequisite state.
- Updated the commander runbook, backlog, and decision log.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `node --check scripts/check-commander-review-packet.mjs`
- `git diff --check`
- Generated packet includes `npm run external-rewards:check-prereqs`.
- Checker does not report the new command missing on generated packets.
- Checker reports `Missing required command: npm run external-rewards:check-prereqs` when the command is removed.
- `npm run qa:commander-review-packet -- --help`
- `npm run qa:commander-review-packet:check -- --help`
- `npm run qa:commander-review-packet:index --if-present`

## Notes

- External reward QR candidates still have the stricter `npm run qr:external-rewards:preflight` command in the external reward section.
