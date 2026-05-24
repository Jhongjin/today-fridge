# Phase 162 Brief - Console Asset Summary

## Why

Queue Preview regenerates console assets, but reviewers had to open logs to see the verified dimensions and sizes. The workflow summary should carry that evidence next to the bundle budget summary.

## Changed

- Added `--github-summary` to `scripts/capture-console-assets.mjs`.
- The capture script writes verified asset file names, dimensions, and sizes to `GITHUB_STEP_SUMMARY`.
- Queue Preview now runs `npm run qa:console-assets -- --github-summary`.
- Updated deployment and submission screenshot docs, backlog, and decision log.

## Validation

- `node --check scripts/capture-console-assets.mjs`
- `npm run qa:console-assets -- --help`
- `npm run qa:console-assets -- --github-summary` with temp `GITHUB_STEP_SUMMARY`
- `npm run --silent qa:console-assets -- --json --github-summary` with temp `GITHUB_STEP_SUMMARY`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm test --if-present`
- `npm run test:e2e --if-present`

## Notes

- Normal table output and JSON output remain available.
