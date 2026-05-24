# Phase 163 Brief - Korean Copy Summary

## Why

Queue Preview runs the Korean copy guard, but reviewers had to inspect logs to see which files passed. The workflow summary should include the file-level copy guard status beside bundle and console asset evidence.

## Changed

- Added `--github-summary` to `scripts/check-korean-copy.mjs`.
- The guard writes file status and issues to `GITHUB_STEP_SUMMARY`.
- Queue Preview now runs `npm run qa:korean-copy -- --github-summary`.
- Updated listing copy docs, deployment docs, backlog, and decision log.

## Validation

- `node --check scripts/check-korean-copy.mjs`
- `npm run qa:korean-copy -- --help`
- `npm run qa:korean-copy -- --github-summary` with temp `GITHUB_STEP_SUMMARY`
- `npm run --silent qa:korean-copy -- --json --github-summary` with temp `GITHUB_STEP_SUMMARY`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm test --if-present`
- `npm run test:e2e --if-present`

## Notes

- Normal table output and JSON output remain available.
