# Phase 171 Brief - Submission Screenshot Summary

## Why

Submission screenshot capture already has JSON evidence, but automation had to inspect logs or artifact folders to see dimensions and file sizes. A GitHub summary makes the QA screenshot set easier to review when capture runs in Actions.

## Changed

- Added `--github-summary` to `scripts/capture-submission-screenshots.mjs`.
- Reused the captured PNG metadata for JSON and summary output.
- Updated submission screenshot docs, backlog, and decision log.

## Validation

- `node --check scripts/capture-submission-screenshots.mjs`
- `npm run qa:screenshots -- --help`
- `git diff --check`
- `npm run qa:screenshots -- --json --github-summary`

## Notes

- Generated screenshots remain under ignored `qa/artifacts/submission-screenshots/`.
