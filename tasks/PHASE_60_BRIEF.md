# Phase 60 Brief

## Queue

QA analytics leaderboard audit visibility.

## Commander Intent

Leaderboard audit receipts should be visible during QR/device testing, not only hidden in the in-memory event object. The QA panel now prioritizes score-audit fields for `leaderboard_submit` events.

## Changes

- QA analytics panel displays leaderboard submit status, score, board, seed, route, and score receipt fields.
- Added a stable `leaderboard-submit` test ID to the result action.
- Added browser coverage for the visible audit receipt.
- Updated analytics implementation docs.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
