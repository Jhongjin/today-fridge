# Phase 166 Brief - External Reward Prereq Summary

## Why

Real contacts, rewarded ad, and promotion rewards remain intentionally gated until QR/device evidence. Queue Preview should make that gate visible in the workflow summary so reviewers can confirm whether real external reward mode is off, ready, or blocked by missing Toss console values.

## Changed

- Added `--github-summary` support to `scripts/check-external-reward-prereqs.mjs`.
- Added external reward prerequisite reporting to the Queue Preview Validate Harness before build.
- Updated readiness/status docs, backlog, and decision log.

## Validation

- `node --check scripts/check-external-reward-prereqs.mjs`
- `npm run external-rewards:check-prereqs -- --help`
- `npm run external-rewards:check-prereqs -- --github-summary`
- `npm run external-rewards:check-prereqs -- --require-real --github-summary` (failed as expected, summary written)
- `git diff --check`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run check:bundle --if-present`

## Notes

- Normal Queue Preview remains non-blocking when real external rewards are not requested.
- QR candidate builds still fail when real external reward mode is requested without the required env values.
