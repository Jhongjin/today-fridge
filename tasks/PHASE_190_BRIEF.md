# Phase 190 Brief

## Queue

Smallest-mobile first viewport board peek.

## Goal

Keep the 360 x 740 first viewport visibly game-like after the main dock and icon booster polish.

## Done

- Added a small-width-only layout compression for 374px and below.
- Reduced top spacing, control sizes, mission strip density, and status dock density only on the minimum viewport range.
- Preserved larger 390/430 layouts and all existing controls/test IDs.
- Updated first-screen creative notes, backlog, and decision log.

## Verification

- Local browser screenshot review at 360 x 740.
- `node node_modules/@playwright/test/cli.js test tests/playwright/first-screen.spec.ts`
- `node node_modules/vite/bin/vite.js build`
- `git diff --check`

## Notes

- This is layout-only and does not change gameplay.
- Production deploy still requires explicit commander approval.
