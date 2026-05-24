# Phase 161 Brief - Bundle Budget Summary

## Why

Bundle budget checks now have JSON output, but Queue Preview still only exposed the line in job logs. A GitHub summary makes the total, budget, file sizes, and source-map state visible next to other queue evidence.

## Changed

- Added `--github-summary` to `scripts/check-bundle-budget.mjs`.
- The bundle guard writes a Markdown summary with status, total size, budget, over-budget bytes, source maps, file sizes, and issues.
- Queue Preview now runs `npm run check:bundle -- --github-summary`.
- Updated deployment docs, backlog, and decision log.

## Validation

- `node --check scripts/check-bundle-budget.mjs`
- `npm run check:bundle -- --help`
- Ready `npm run check:bundle -- --github-summary` with temp `GITHUB_STEP_SUMMARY`.
- Over-budget `BUNDLE_BUDGET_BYTES=1 npm run check:bundle -- --github-summary` - failed as expected and wrote a not-ready summary.
- `npm run --silent check:bundle -- --json --github-summary`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run build --if-present`
- `npm run check:bundle -- --github-summary`
- `npm run check:bundle --if-present`
- `npm test --if-present`
- `npm run test:e2e --if-present`

## Notes

- Normal CLI output and JSON output remain available.
