# Phase 193 Brief

## Queue

Commander packet 360 screenshot checklist.

## Goal

Make the new minimum-width first-fold screenshot evidence visible in commander review packets.

## Done

- Updated the commander review packet evidence checklist to name both `00-small-first-viewport.png` and `00-first-viewport.png`.
- Updated the commander deploy runbook and screenshot docs to describe 360/390 first-fold evidence.
- Updated backlog and decision log.

## Verification

- `node --check scripts/create-commander-review-packet.mjs`
- Generated packet print contains both first-fold screenshot file names.
- `git diff --check`

## Notes

- This is documentation/checklist alignment only.
- Production deploy still requires explicit commander approval.
