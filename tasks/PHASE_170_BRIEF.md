# Phase 170 Brief - QR Evidence Check Summary

## Why

QR session evidence checks fail fast when session files are missing or incomplete, but automation previously had to read logs to see the file-level issues. A GitHub summary makes QR readiness and open issues visible beside the generated QR session index.

## Changed

- Added `--github-summary` to `scripts/check-qr-session-evidence.mjs`.
- Updated QR session harness docs, backlog, and decision log.

## Validation

- `node --check scripts/check-qr-session-evidence.mjs`
- `npm run qa:qr-session:check -- --help`
- `git diff --check`
- `npm run qa:qr-session:check -- --github-summary` (failed as expected with no session files, summary written)

## Notes

- Existing `--json` behavior and failure semantics are unchanged.
