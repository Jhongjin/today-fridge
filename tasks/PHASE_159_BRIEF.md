# Phase 159 Brief - Bundle Budget JSON

## Why

The bundle budget guard is part of every queue preview, but it only printed a human-readable summary. Automation and review evidence can use a structured result that includes total size, budget, source map findings, and file sizes.

## Changed

- Added `--json` support to `scripts/check-bundle-budget.mjs`.
- JSON mode reports readiness, `dist` path, total bytes, budget bytes, over-budget bytes, source map paths, file sizes, and issues.
- Missing `dist` or invalid `BUNDLE_BUDGET_BYTES` now also returns structured JSON when `--json` is set.
- Updated deployment pipeline docs, backlog, and decision log.

## Validation

- `node --check scripts/check-bundle-budget.mjs`
- `npm run check:bundle -- --help`
- `npm run --silent check:bundle -- --json`
- `BUNDLE_BUDGET_BYTES=1 npm run --silent check:bundle -- --json` - failed as expected with structured issues.
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm test --if-present`
- `npm run test:e2e --if-present`

## Notes

- Human-readable output and failure behavior are unchanged when `--json` is omitted.
