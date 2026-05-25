# Phase 192 Brief

## Queue

360 first-viewport screenshot evidence.

## Goal

Make the minimum-width first-screen layout visible in automated submission screenshot evidence.

## Done

- Added `00-small-first-viewport.png` to submission screenshot capture.
- Captured the new file at 360 x 740 before the existing 390 x 844 flow.
- Updated screenshot documentation, backlog, and decision log.

## Verification

- `node --check scripts/capture-submission-screenshots.mjs`
- `node scripts/capture-submission-screenshots.mjs --json`
- `git diff --check`

## Notes

- The new PNG artifact remains ignored by git with the other generated screenshots.
- Production deploy still requires explicit commander approval.
