# FIRST_DAILY_BOARD

## 1. One-Sentence Explanation

> 앞줄 재료를 정리해 뒤쪽 임박 재료를 꺼내고, 밥+김치+계란으로 김치볶음밥을 완성한다.

## 2. Board Identity

| Field | Value |
| --- | --- |
| Board ID | `daily_001_kimchi_fried_rice` |
| Seed | `2026-05-22-KR-kimchi-rescue-v1` |
| Tier | 2.5, between Daily Basic and Rescue |
| Target round length | 60-90 seconds |
| Tray slots | 6 |
| Move limit | 26 |
| Timer | None for ranked MVP; duration used only as tie-breaker |
| Main recipe | 김치볶음밥: 밥, 김치, 계란 |
| Side goal | 임박 재료 4개 구출 |
| Clear condition | Main recipe complete and at least 8 total clears |

## 3. Scoring Constants

```text
MATCH_CLEAR_POINTS = 100
RECIPE_EASY_POINTS = 500
EXPIRING_RESCUE_POINTS = 80
UNRESCUED_EXPIRING_PENALTY = 120
COMBO_MULTIPLIERS = [1.0, 1.2, 1.4, 1.6]
REMAINING_TRAY_SLOT_POINTS = 30
ZERO_WASTE_BONUS = 500
MOVE_EFFICIENCY_BONUS = 10 per unused move, capped at 100
```

Score formula:

```text
FridgeScore =
  clearPoints
+ recipePoints
+ rescueBonus
+ comboBonus
+ remainingTrayBonus
+ zeroWasteBonus
+ moveEfficiencyBonus
- wastePenalty
```

## 4. Ranked Fairness Rules

- Ranked board uses no ad recovery.
- Ranked board records booster usage.
- First MVP leaderboard should either reject booster-used scores or mark them separately.
- Replay is allowed because the daily board is a mastery puzzle.
- Same seed and same move sequence must produce the same score.

## 5. Non-Ranked Recovery Rules

Recovery options are allowed only after a failed or non-ranked run:

- Watch rewarded ad for `+3 moves`.
- Use `정리집게` to remove one tray ingredient.
- Use `냉동칸` to hold one ingredient outside tray.

Non-ranked recovery runs should not overwrite ranked no-booster best score.

## 6. Ingredient Counts

| Ingredient | Fresh Count | Expiring Count | Total |
| --- | ---: | ---: | ---: |
| 밥 | 3 | 1 | 4 |
| 김치 | 3 | 1 | 4 |
| 계란 | 3 | 1 | 4 |
| 대파 | 3 | 0 | 3 |
| 두부 | 2 | 1 | 3 |
| 애호박 | 3 | 0 | 3 |
| 버섯 | 3 | 0 | 3 |
| 간장 | 3 | 0 | 3 |
| Total | 23 | 4 | 27 |

The board has 30 visible cells, but some cells have a back item. This creates reveal order without overcrowding.

## 7. Board Coordinate System

Fridge board:

- 5 columns: `A` to `E`
- 6 rows: `1` to `6`
- Each coordinate can contain a front item and optional back item.

Notation:

```text
A1: front/back
```

## 8. Initial Layout

```text
Row 1: A1 rice        B1 kimchi      C1 egg         D1 green_onion E1 tofu
Row 2: A2 zucchini    B2 mushroom    C2 soy_sauce   D2 rice        E2 kimchi
Row 3: A3 egg         B3 tofu        C3 zucchini    D3 mushroom    E3 green_onion
Row 4: A4 kimchi      B4 soy_sauce   C4 rice        D4 egg         E4 zucchini
Row 5: A5 mushroom    B5 green_onion C5 soy_sauce   D5 tofu        E5 rice_expiring
Row 6: A6 kimchi_exp  B6 egg_exp     C6 tofu_exp    D6 blocker     E6 blocker
```

Back items:

```text
B2: rice
C3: kimchi
D4: egg
A5: soy_sauce
```

Blocked cells:

- `D6`, `E6` are large containers that cannot be selected. They visually create bottom clutter but do not affect solvability.

## 9. Verified Clean Completion Route

This is not the only solution. It is the first automated validation route proving that the board can be completed without boosters.

1. Select `E1` 두부.
2. Select `B3` 두부.
3. Select `C6` 임박 두부. This clears tofu and rescues 1 expiring ingredient.
4. Select `E5` 임박 밥.
5. Select `A6` 임박 김치.
6. Select `B6` 임박 계란. This completes 김치볶음밥 and rescues 3 more expiring ingredients.

Expected result:

- Main recipe complete.
- Expiring rescue count `4/4`.
- Zero waste bonus earned.
- Clean ranked score can be submitted.

## 10. Expected Score Range

| Player Outcome | Expected Score |
| --- | ---: |
| First-time clear with some waste | 1,100-1,500 |
| Clean clear, low combo | 1,600-2,100 |
| Optimized route, zero waste | 2,300-2,800 |
| Excellent route with combo chain | 2,900+ |

## 11. Failure Modes

Player should understand these immediately:

- Tray full with no match or recipe clear.
- Too many expiring ingredients left behind.
- Main recipe not completed before move limit.

Failure copy should avoid shame:

- "한 칸만 더 여유가 있었으면 됐어요"
- "임박 재료가 조금 남았어요"
- "다음 판은 김치볶음밥부터 노려볼까요?"

## 12. Prototype Validation Checklist

- Board can be completed without boosters.
- All eight ingredient types are distinguishable on mobile.
- Expiring state is visible without relying only on color.
- Recipe goal remains visible while playing.
- Same move sequence produces same score.
- No text overlaps at 360x740.
- Verified route: `E1, B3, C6, E5, A6, B6`.

