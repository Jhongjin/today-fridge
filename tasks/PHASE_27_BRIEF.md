# PHASE_27_BRIEF

## Queue

Daily seed storage scope.

## Goal

Make personal bests and fixed reward claims reset with each 05:00 KST daily seed.

## Acceptance Criteria

- App uses `board.id:board.seed` for daily personal best storage.
- Completion and participation rewards use the same daily key.
- Unit tests cover separate personal best and reward state across daily keys.

## Commander Notes

This fixes the main follow-up risk introduced by the runtime daily seed.
