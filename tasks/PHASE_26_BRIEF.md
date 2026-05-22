# PHASE_26_BRIEF

## Queue

05:00 KST daily seed key.

## Goal

Make the runtime board seed match the daily refresh rule without changing the hand-authored MVP board.

## Acceptance Criteria

- Daily date key flips at 05:00 KST.
- Runtime board seed preserves the existing seed body.
- Unit tests cover the refresh boundary.
- The app uses the daily seed wrapper.

## Commander Notes

This is not procedural board generation. It is the seed-date foundation for that later queue.
