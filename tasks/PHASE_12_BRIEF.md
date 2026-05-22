# PHASE_12_BRIEF

## Queue

Analytics and retention instrumentation harness.

## Goal

Make the MVP measurable before the real Toss analytics transport is selected, especially for first-play comprehension, replay intent, and clean score submission.

## Acceptance Criteria

- Every event receives the shared analytics envelope from `ANALYTICS_SCHEMA.md`.
- The app tracks first screen readiness, round start, move commits, clears, completion/failure, and leaderboard submission.
- Unit tests lock event shape and ordering.
- Documentation captures current coverage and future transport queues.

## Commander Notes

The implementation remains local and in-memory. It does not collect personal data and does not send analytics off-device.
