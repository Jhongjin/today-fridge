# Phase 173 Brief - QA Helper Surface Guard

## Why

The QA helper scripts now expose consistent `--help`, `--json`, and `--github-summary` surfaces where appropriate. Queue Preview should catch regressions if a helper loses one of those automation options.

## Changed

- Added `scripts/check-qa-helper-surface.mjs`.
- Added `npm run qa:helper-surface`.
- Added the helper surface check to Queue Preview with `--github-summary`.
- Updated deployment/QA docs, backlog, and decision log.

## Validation

- `node --check scripts/check-qa-helper-surface.mjs`
- `npm run qa:helper-surface -- --help`
- `git diff --check`
- `npm run qa:helper-surface -- --github-summary`
- `npm run qa:helper-surface -- --json`
- `npm run qa:korean-copy --if-present`

## Notes

- Creator scripts are checked for generator-specific flags like `--print`, `--output`, and `--external-rewards` rather than JSON or summary output.
