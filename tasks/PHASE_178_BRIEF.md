# Phase 178 Brief - Rating Evidence Checklist

## Why

Phase 176 added `npm run qa:rating-evidence:check` as a required local command. The commander packet evidence checklist should also state that the rating evidence packet was generated and checked, so reviewers see the requirement in both the command list and the evidence checklist.

## Changed

- Added a rating evidence checker row to generated commander review packets.
- Updated backlog and decision log.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `git diff --check`
- Generated commander packet contains the rating evidence checker checklist row.
- `npm run qa:commander-review-packet:check -- --stdin --json` does not report `npm run qa:rating-evidence:check` missing on generated packets.

## Notes

- This only changes generated review packet text.
