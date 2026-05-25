# Phase 191 Brief

## Queue

First tile viewport QA lock.

## Goal

Prevent the first playable board from slipping completely below the fold on mobile first load.

## Done

- Added a Playwright assertion that the first board tile starts inside the current viewport.
- Kept the assertion in the existing first-screen test so it runs across 360, 390, and 430 mobile projects.
- Updated backlog and decision log.

## Verification

- `node node_modules/@playwright/test/cli.js test tests/playwright/first-screen.spec.ts`
- `git diff --check`

## Notes

- This is QA-only and does not change runtime behavior.
- Production deploy still requires explicit commander approval.
