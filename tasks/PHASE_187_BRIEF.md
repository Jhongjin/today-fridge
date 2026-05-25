# Phase 187 Brief

## Queue

First-screen main dock polish.

## Goal

Make the first playable screen feel more like a cute casual game main screen without adding a blocking landing page or start modal.

## Done

- Converted the top status row into a three-badge main dock.
- Preserved existing profile and daily refresh test IDs.
- Added a recipe-book progress badge with current recipe ingredient icons.
- Updated first-screen creative notes, backlog, and decision log.

## Verification

- `node node_modules/vitest/vitest.mjs run`
- `node scripts/check-external-reward-prereqs.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/vite/bin/vite.js build`
- `node scripts/check-bundle-budget.mjs`
- `node scripts/capture-submission-screenshots.mjs --json`
- `node node_modules/@playwright/test/cli.js test`
- Local browser screenshot review at 390 x 844 and 430 x 932.
- `git diff --check`

## Notes

- The board remains immediately playable on first load.
- Production deploy still requires explicit commander approval.
