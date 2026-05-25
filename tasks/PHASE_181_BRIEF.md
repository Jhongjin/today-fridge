# Phase 181 Brief

## Queue

First-viewport screenshot evidence.

## Goal

Make first-impression review repeatable by saving the actual 390x844 visible fold before the existing full-page submission screenshots.

## Done

- Added `00-first-viewport.png` to `npm run qa:screenshots`.
- Captured that file with `fullPage: false` before the existing first playable full-page screenshot.
- Kept the existing six flow screenshots and JSON/GitHub summary reporting.
- Updated submission screenshot docs, backlog, and decision log.

## Verification

- `node --check scripts/capture-submission-screenshots.mjs`
- `npm run qa:screenshots -- --json`
- `npm run qa:korean-copy --if-present`
- `npm run qa:helper-surface --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- Visual review of `qa/artifacts/submission-screenshots/00-first-viewport.png`

## Notes

- This is QA evidence only. Generated PNGs remain ignored by git.
- Production deploy still requires explicit commander approval.
