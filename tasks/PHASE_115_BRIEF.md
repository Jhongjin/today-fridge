# Phase 115 Brief - GitHub Actions Runtime Warning Cleanup

## Summary

- Updated workflow actions to Node 24-runtime majors:
  - `actions/checkout@v6`
  - `actions/setup-node@v6`
- Updated both `Queue Preview` and `Commander Production Deploy` workflows.
- Recorded the CI warning cleanup in backlog and decision log.

## References

- `actions/checkout` notes that v5 updated the action to the Node 24 runtime, and the current README shows v6 usage.
- `actions/setup-node` current README documents v6 usage and supported Node versions.

## Validation

- Workflow scan: `rg "actions/(checkout|setup-node)@v4" -n .github docs tasks harness` - no matches.
- Workflow scan: `rg "actions/(checkout|setup-node)@" -n .github` - only v6 references remain.
- Unit suite: `npm test --if-present` - 33 files, 131 tests passed.
- Build: `npm run build --if-present` - passed, including external reward preflight no-op path.
- Bundle budget: `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- E2E suite: `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The actual Node 20 warning removal can only be confirmed on the next GitHub Actions run.
