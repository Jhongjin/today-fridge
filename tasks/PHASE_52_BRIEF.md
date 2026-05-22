# PHASE_52_BRIEF

## Queue

Mission summary analytics event.

## Goal

Make result mission completion measurable so the team can see whether players miss recipe completion, rescue, or clean-record goals.

## Acceptance Criteria

- Completed rounds emit `mission_summary`.
- Failed rounds emit `mission_summary`.
- Event includes completed count, total count, and per-mission booleans.
- Analytics schema and implementation docs list the event.

## Commander Notes

This measures player understanding and replay opportunities without changing gameplay or rewards.
