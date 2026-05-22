# PHASE_24_BRIEF

## Queue

Result-panel mobile overflow guard.

## Goal

Keep the completion/failure result panel usable as actions and reward details grow.

## Acceptance Criteria

- Result panel has a viewport-bounded max height.
- Overflow content scrolls inside the panel instead of leaving the screen.
- Mobile browser test asserts the result panel stays within the viewport.

## Commander Notes

This protects small-screen Toss WebView usability before more result actions are added.
