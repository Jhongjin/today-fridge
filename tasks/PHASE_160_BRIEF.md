# Phase 160 Brief - Preview Deploy Preflight Summary

## Why

The Optional Preview Deploy job had its own shell gate while the repository also had `npm run deploy:check-prereqs`. Keeping the job on the same script makes local diagnostics, workflow output, and commander packet evidence line up.

## Changed

- Added `--github-summary` to `scripts/check-deploy-prereqs.mjs`.
- The preflight can now write `enabled=true|false` to `GITHUB_OUTPUT` and a Markdown prerequisite table to `GITHUB_STEP_SUMMARY`.
- Updated Queue Preview to run `npm run deploy:check-prereqs -- --github-summary` in Optional Preview Deploy.
- Updated deployment docs, Vercel preview setup docs, backlog, and decision log.

## Validation

- `node --check scripts/check-deploy-prereqs.mjs`
- `npm run deploy:check-prereqs -- --help`
- Missing-env `npm run --silent deploy:check-prereqs -- --json --github-summary` with temp `GITHUB_OUTPUT` and `GITHUB_STEP_SUMMARY` - wrote `enabled=false`.
- Ready-env `npm run --silent deploy:check-prereqs -- --json --github-summary` with temp `GITHUB_OUTPUT` and `GITHUB_STEP_SUMMARY` - wrote `enabled=true`.
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm test --if-present`
- `npm run test:e2e --if-present`

## Notes

- Preview deployment remains skipped until `AUTO_DEPLOY_ENABLED`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured.
