# TUTORIAL_FLOW_V1

## Phase 14 Scope

The first-play tutorial is a short, non-blocking hint rail. It does not pause the board or require a modal.

## Steps

1. `match`: highlight the first safe three-of-a-kind route.
2. `recipe`: highlight the first recipe completion route.
3. `done`: remove tutorial UI after recipe completion, round completion, or manual close.

## Copy

- `match`: "두부 3개 먼저 정리"
- `recipe`: "밥 + 김치 + 계란 완성"

The copy stays short because the board itself should teach the interaction.

## Highlight Targets

Match step:

- `E1`
- `B3`
- `C6`

Recipe step:

- `E5`
- `A6`
- `B6`

These are aligned with the first clean completion route documented in `FIRST_DAILY_BOARD.md`.

## Guardrails

- The tutorial never blocks tapping.
- The player can dismiss it.
- Highlighting is visual assistance, not a forced path.
- Replay after a completed board does not re-open the hint rail in the same session.
- The hint rail does not affect score, fairness flags, or leaderboard submission.

## Future Queues

- Persist tutorial completion across sessions.
- Wire `tutorial_001_kimchi_fried_rice` only if first-run completion rate is below target or commander wants a separate practice entry.
- Track `tutorial_step_complete` once the analytics transport is connected.
