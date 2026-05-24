# Phase 165 Brief - SDK Dependency Summary

## Why

Commander review packets require SDK dependency triage, but Queue Preview did not surface the SDK latest/audit evidence in the workflow summary. Reviewers needed to rerun or hunt through logs to confirm the risk snapshot.

## Changed

- Added `--github-summary` support to `scripts/check-sdk-dependency-triage.mjs`.
- Added strict SDK dependency triage to the Queue Preview Validate Harness.
- Updated readiness/status docs, backlog, and decision log.

## Validation

- `node --check scripts/check-sdk-dependency-triage.mjs`
- `npm run sdk:dependency-triage -- --help`
- `npm run sdk:dependency-triage -- --strict --github-summary`
- `git diff --check`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- The check still keeps the existing policy: do not run `npm audit fix --force` or downgrade the SDK without commander approval.
