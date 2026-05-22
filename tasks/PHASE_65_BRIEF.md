# Phase 65 Brief

## Queue

QA Toss bridge submit-failure path.

## Commander Intent

QR and real-device testing must cover unhappy paths. A failed leaderboard submit should not trap the player or permanently mark the play as already submitted.

## Changes

- Leaderboard duplicate guarding now records a play ID only after successful submit.
- Added `?qa=toss-bridge-error`.
- Added unit coverage for platform retry and QA bridge failure.
- Added Playwright coverage for recoverable submit failure UI.
- Documented the new QA mode.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
