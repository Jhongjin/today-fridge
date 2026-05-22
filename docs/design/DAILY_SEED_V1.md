# DAILY_SEED_V1

## Phase 26 Scope

The MVP now computes the daily seed date key at 05:00 KST.

Rule:

```text
daily_date = KST date after subtracting the 05:00 refresh boundary
seed = daily_date + board seed body
```

Examples:

- `2026-05-22 04:59:59 KST` uses `2026-05-21`.
- `2026-05-22 05:00:00 KST` uses `2026-05-22`.

## Current Board

The first board still uses the same hand-authored layout and route. Only the seed date prefix changes.

Base body:

`KR-kimchi-rescue-v1`

Example runtime seed:

`2026-05-22-KR-kimchi-rescue-v1`

## Why

This keeps the "today's fridge" promise without needing procedural generation yet. Later boards can reuse the same date-key utility while swapping themes and recipes.

## Storage Scope

Daily personal bests and fixed reward claims use:

```text
board.id + ":" + board.seed
```

This means the same hand-authored board can reset best-score and reward state each day while keeping a deterministic seed for analytics and leaderboard submission.

## Future Queues

- Generate board variants from the seed.
- Add a countdown to the next 05:00 KST refresh.
