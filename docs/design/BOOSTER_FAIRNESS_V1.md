# BOOSTER_FAIRNESS_V1

## Phase 15 Scope

The MVP now has one active comfort booster: `힌트`.

It highlights the next useful cell in the locked clean route. It does not move ingredients, remove risk, multiply score, or change the board.

## Clean Score Rule

A run is clean only when:

```text
ranked_mode == true
AND booster_used == false
AND ad_recovery_used == false
AND share_bonus_used == false
```

Using `힌트` sets `booster_used = true`.

## UX Rule

After `힌트` is used:

- The play screen shows a fairness note.
- The completed score does not update the clean personal best.
- The leaderboard submission service skips clean submission with `BOOSTER_USED`.

## Button Status

Current MVP:

- `정리집게`: disabled, future queue.
- `냉동칸`: disabled, future queue.
- `힌트`: active, marks the run as non-clean.

## Why This Matters

This lets stuck players continue without turning leaderboard competition into a booster race. It also gives older first-time players a recovery path while preserving clean daily competition.

## Future Queues

- Add non-ranked comfort score history.
- Add active tray cleanup booster.
- Add active hold-slot booster.
- Show clean/non-clean split in result history.
