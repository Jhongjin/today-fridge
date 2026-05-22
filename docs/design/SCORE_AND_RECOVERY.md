# SCORE_AND_RECOVERY

## 1. Score Purpose

The score should create "one more try" motivation. It should reward route quality without becoming opaque.

Players should understand:

- Matching ingredients gives points.
- Completing a recipe gives a big bonus.
- Rescuing expiring ingredients matters.
- Leaving waste hurts the score.
- Empty tray slots and unused moves are small mastery bonuses.

## 2. MVP Score Constants

| Constant | Value |
| --- | ---: |
| Identical match clear | 100 |
| Easy recipe | 420-500 |
| Normal recipe | 500-650 |
| Expiring rescue | 80 |
| Unrescued expiring penalty | -120 |
| Remaining tray slot | 30 |
| Zero waste bonus | 500 |
| Unused move bonus | 10, capped at 100 |
| Combo cap | 1.6x |

## 3. Combo Rule

Combo increases when the player clears on consecutive moves.

```text
comboIndex 0 = 1.0x
comboIndex 1 = 1.2x
comboIndex 2 = 1.4x
comboIndex 3+ = 1.6x
```

The multiplier applies only to the clear that triggered it. It does not multiply the whole final score.

## 4. Ranked Recovery Separation

Ranked clean score:

- No ad recovery.
- No paid recovery.
- Booster use either disqualifies from clean rank or is marked separately.

Non-ranked comfort run:

- May use rewarded ad recovery.
- May use boosters.
- Can earn collection progress and participation rewards.
- Should not overwrite clean ranked score.

## 5. Result Screen Breakdown

Show score components in simple lines:

- 재료 정리
- 레시피 완성
- 임박 재료 구출
- 콤보
- 남은 칸 보너스
- 음식물 낭비 감소

Do not show an overwhelming formula. The detailed formula belongs in the engine and QA tests.

