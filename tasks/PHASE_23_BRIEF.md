# PHASE_23_BRIEF

## Queue

Result-screen leaderboard open action.

## Goal

Complete the first competition loop by letting players open the leaderboard from the result screen.

## Acceptance Criteria

- Leaderboard service exposes `open(source)`.
- `leaderboard_open` analytics event is tracked.
- Result screen shows a `랭킹 보기` action after completion.
- Mobile browser tests cover the action.

## Commander Notes

The action still uses the mock Toss client locally. Real Toss SDK wiring remains gated by the SDK package install/runtime queue.
