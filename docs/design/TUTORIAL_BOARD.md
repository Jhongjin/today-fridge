# TUTORIAL_BOARD

## Purpose

The tutorial board is a tiny practice fridge for first-run teaching. It is not yet wired into the live app. Its job is to keep the first playable lesson stable before a later queue decides whether to route new users into a separate tutorial round.

## Board Identity

| Field | Value |
| --- | --- |
| Board ID | `tutorial_001_kimchi_fried_rice` |
| Seed | `tutorial-fixed-kimchi-v1` |
| Target length | 20-30 seconds |
| Tray slots | 6 |
| Move limit | 10 |
| Main recipe | `kimchi_fried_rice` |
| Rescue target | 1 expiring ingredient |
| Ranked eligibility | Never submit tutorial scores |

## Teaching Sequence

1. Select `A1`, `B1`, `C1` to clear tofu.
2. `C1` is expiring, so the player sees rescue feedback.
3. Select `A2`, `B2`, `C2` to complete kimchi fried rice.
4. End immediately after recipe completion and one rescue.

## Layout

```text
Row 1: A1 tofu        B1 tofu        C1 tofu_expiring D1 green_onion E1 mushroom
Row 2: A2 rice        B2 kimchi      C2 egg           D2 zucchini     E2 soy_sauce
Row 3: A3 blocker     B3 blocker
```

## Route Constants

```text
match = A1, B1, C1
recipe = A2, B2, C2
cleanCompletion = A1, B1, C1, A2, B2, C2
```

These are exported as `tutorialBoardRoute` from `src/game/data/boards.ts`.

## Expected Result

- Match clear points: `100`.
- Recipe points: `500`.
- Rescue bonus: `80`.
- Clean completion route moves: `6`.
- Expected score: `1,400`.

## Guardrails

- Tutorial score must not submit to Toss Game Center.
- Tutorial rewards must be separate from daily board rewards.
- Tutorial completion can trigger only a fixed non-ranked reward if a future queue adds one.
- The live daily board remains the first screen until commander approves a separate first-run tutorial route.
