# Phase 158 Brief - Submission Screenshot JSON

## Why

Console asset capture already has JSON output for automation evidence, but submission screenshot capture only printed a human message. Review tooling benefits from the same structured output for the generated QA screenshots.

## Changed

- Added `--json` support to `scripts/capture-submission-screenshots.mjs`.
- JSON mode suppresses Vite logs and prints output directory plus generated PNG width, height, bytes, and kilobytes.
- Updated submission screenshot docs, backlog, and decision log.

## Validation

- `node --check scripts/capture-submission-screenshots.mjs`
- `npm run qa:screenshots -- --help`
- `npm run --silent qa:screenshots -- --json`
- `npm run qa:screenshots --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run deploy:check-prereqs --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- Human-readable capture output is unchanged when `--json` is omitted.
