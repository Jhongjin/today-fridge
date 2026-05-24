# Phase 179 Brief - Rating Evidence Checkbox Guard

## Why

Rating evidence packets include checklist items for store/GRAC evidence, screenshots, and content guardrails. The checker should reject unchecked required checklist items, while still allowing the unselected evidence path and unselected decision options.

## Changed

- Tightened `scripts/check-game-rating-evidence.mjs` to report unchecked non-decision checklist items.
- Updated backlog and decision log.

## Validation

- `node --check scripts/check-game-rating-evidence.mjs`
- `git diff --check`
- `npm run qa:rating-evidence:check -- --help`
- Filled temp store self-rating sample still passed `npm run qa:rating-evidence:check -- <file> --json`
- Temp sample with one unchecked required checklist item failed and reported `Evidence still has 1 unchecked checklist item(s).`

## Notes

- Evidence path and commander decision options still require exactly one checked option.
