# Phase 116 Brief - SDK Dependency Triage

## Summary

- Added `docs/platform/SDK_DEPENDENCY_TRIAGE.md` to capture the Apps in Toss SDK engine and audit position.
- Moved `Queue Preview` validation to Node `24` so CI covers the SDK package engine requirement.
- Linked the triage note from deployment, submission readiness, Toss requirement, backlog, and decision-log docs.
- Locked the policy that SDK audit findings must not be resolved with `npm audit fix --force` or an automatic downgrade from `@apps-in-toss/web-framework@2.6.0`.

## Triage Snapshot

- Local validation runtime: Node `22.22.0`, npm `10.9.4` from `.tools/`.
- GitHub validation runtime: Node `24` through `actions/setup-node@v6`.
- SDK package: `@apps-in-toss/web-framework@2.6.0`, current npm latest at the time of triage.
- SDK engine source: `@apps-in-toss/ait-format@1.0.0` declares `node >=24`.
- Audit snapshot:
  - Production dependencies: 28 total findings, including 1 critical.
  - Full tree: 31 total findings, including 1 critical.

## Validation

- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- Local bundled tooling is still Node `22`; Node `24` coverage depends on GitHub Actions until a local Node 24 bundle is added.
- The audit findings remain open by policy and must be revisited against the actual QR/review candidate commit.
