# Phase 120 Brief - Commander Packet Worktree Status

## Summary

- Added `Working tree` metadata to commander QR review packets.
- The packet now reports `clean`, `dirty (<n> change(s))`, or `unknown` from local Git status.
- Updated the commander deploy runbook to tell reviewers to generate packets from a clean tree after the intended commit is pushed.
- Recorded the queue in backlog and decision log.

## Validation

- Packet print while local edits were present - metadata reported `dirty (4 change(s))`.
- `npm test --if-present` - 33 files, 131 tests passed.
- `npm run build --if-present` - passed, including external reward preflight no-op path.
- `npm run check:bundle --if-present` - 227.1 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 54 tests passed.

## Remaining Risk

- The status is captured at packet generation time. If the generated packet file is written inside the repo, it may create a new untracked artifact after the status is recorded.
