# Phase 182 Brief

## Queue

Queue Preview submission screenshot summary.

## Goal

Make first-fold and full-flow screenshot metadata visible in the Queue Preview GitHub Actions summary for every pushed queue commit.

## Done

- Added `npm run qa:screenshots -- --github-summary` to Queue Preview after console asset capture and before Playwright tests.
- Updated deployment, QA harness, readiness, MVP status, backlog, and decision log docs to include submission screenshot summary evidence.

## Verification

- `npm run qa:screenshots -- --github-summary` with a temporary `GITHUB_STEP_SUMMARY`
- Confirmed summary includes `00-first-viewport.png` at `390x844`
- `npm run qa:helper-surface --if-present`
- `npm run qa:korean-copy --if-present`
- `git diff --check`

## Notes

- This records screenshot dimensions and sizes in the workflow summary. Generated PNG artifacts remain local/ignored unless the workflow is later extended to upload artifacts.
- Production deploy still requires explicit commander approval.
