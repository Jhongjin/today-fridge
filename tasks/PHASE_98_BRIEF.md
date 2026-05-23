# Phase 98 Brief - Apps In Toss SDK Package Lock

## Summary

- Added `@apps-in-toss/web-framework@2.6.0` as an exact dependency in `package.json` and `package-lock.json`.
- Re-ran the previously blocked install path:
  - `npm install @apps-in-toss/web-framework@2.6.0 --save-exact --package-lock-only --ignore-scripts` succeeded in about 54 seconds.
  - `npm install --ignore-scripts --no-audit --no-fund` succeeded in about 4 minutes.
- Updated SDK status docs, readiness docs, SDK queue, backlog, and decision log from "install blocked" to "package locked, import pending".
- Captured remaining SDK dependency warnings: Node `>=24` engine warning for `@apps-in-toss/ait-format@1.0.0`, React Native peer override warnings, and npm audit findings.

## Validation

- Package presence: `npm ls @apps-in-toss/web-framework --package-lock-only` - `@apps-in-toss/web-framework@2.6.0`.
- `npm test --if-present` - 26 files, 103 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- The app still uses the injected bridge or mock client; official SDK imports are not wired yet.
- CI/package environments may need Node 24 for Apps in Toss packaging paths.
- npm audit triage is required before final submission.
