# Phase 117 Brief - SDK Dependency Triage Refresh Command

## Summary

- Added `scripts/check-sdk-dependency-triage.mjs`.
- Added `npm run sdk:dependency-triage` for QR/review candidate dependency refreshes.
- The command reports:
  - local Node and npm versions,
  - locked `@apps-in-toss/web-framework` version,
  - latest npm SDK version,
  - `@apps-in-toss/ait-format` Node engine requirement,
  - production and full-tree npm audit counts,
  - semver-major npm audit fix hints.
- Added `--json` output and `--strict` review checks.
- Linked the refresh command from submission and SDK triage docs.

## Validation

- `npm run sdk:dependency-triage` - passed; current SDK latest is `2.6.0`, audit counts match Phase 116.
- `npm run sdk:dependency-triage -- --json` - passed.
- `npm run sdk:dependency-triage -- --strict` - passed.
- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The command intentionally reports known audit findings instead of failing on them; final review still needs a commander-approved dependency decision.
- Latest SDK lookup requires npm registry access.
