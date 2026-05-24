# Phase 157 Brief - Verification Helper Help

## Why

The QR evidence helpers now expose `--help`, but several other queue verification helpers still started checks, captures, or filesystem reads when an operator only needed option help. The capture scripts were the highest-friction case because help discovery could start Vite.

## Changed

- Added `--help` output to deploy prerequisite, Korean copy, bundle budget, submission screenshot, and console asset scripts.
- Refreshed existing SDK dependency and external reward prerequisite help text to list `--help`.
- Updated deploy runbook, Vercel preview setup docs, backlog, and decision log.

## Validation

- `node --check scripts/check-deploy-prereqs.mjs`
- `node --check scripts/check-korean-copy.mjs`
- `node --check scripts/check-bundle-budget.mjs`
- `node --check scripts/capture-submission-screenshots.mjs`
- `node --check scripts/capture-console-assets.mjs`
- `node --check scripts/check-external-reward-prereqs.mjs`
- `node --check scripts/check-sdk-dependency-triage.mjs`
- `npm run deploy:check-prereqs -- --help`
- `npm run qa:korean-copy -- --help`
- `npm run check:bundle -- --help`
- `npm run qa:console-assets -- --help`
- `npm run qa:screenshots -- --help`
- `npm run external-rewards:check-prereqs -- --help`
- `npm run sdk:dependency-triage -- --help`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run external-rewards:check-prereqs --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm run qa:screenshots --if-present`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- This is a CLI help/output improvement only. It does not change validation, capture, build, or deployment rules.
