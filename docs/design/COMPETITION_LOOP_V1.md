# COMPETITION_LOOP_V1

## Phase 13 Scope

The first competitive loop is personal-best driven. It gives the player a clear reason to replay before friend leaderboard and Toss ranking APIs are fully integrated.

## Loop

1. Player starts today's same-seed fridge.
2. The screen shows the saved personal best for that board.
3. During play, the screen shows the gap to the current personal best.
4. On completion, a higher score updates the personal best immediately.
5. The result panel shows today's attempt count.
6. The result panel shows today's mission completion summary.
7. The result panel shows the improvement delta.
8. The result panel shows the saved best route as ingredient icons.
9. The player can share the result without gaining reward or rank advantage.
10. The player can restart and try a cleaner route.

## Why This Fits The Target

- It is understandable without explaining ranking rules.
- It avoids pressure from public rank before the player understands the puzzle.
- It creates a concrete "one more try" target from the first completed board.
- It is compatible with same-board daily competition later.

## Rules

- Personal best is stored per board id.
- Best route is stored with the personal best.
- Only completed rounds update the personal best.
- Booster and ad-assisted rounds can later be separated with fairness flags.
- Personal best does not grant Toss points or economic reward.

## Events

- `personal_best_update`
- `round_start`
- `round_complete`
- `result_share`
- `leaderboard_submit`

## Future Queues

- Add friend-score preview once the Toss leaderboard API is confirmed.
- Add around-my-rank list on result screen.
- Add "best route replay" QA tooling for deterministic route analysis.
- Split clean personal best from comfort-run personal best when boosters become active.
