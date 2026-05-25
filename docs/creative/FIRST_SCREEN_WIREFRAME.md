# FIRST_SCREEN_WIREFRAME

## 1. First Screen Goal

The first screen should immediately communicate:

> Tap fridge ingredients into the tray, complete today's recipe, and beat today's score.

No marketing hero. No long explanation. The fridge board is the main screen.

## 1.1 Visual Direction Refresh

Phase 180 keeps the first screen playable immediately, but the top stack should read like a compact casual game main screen instead of a document summary.

- Use one warm kitchen/fridge hero HUD around title, recipe mission, score, best score, profile state, and daily refresh.
- Keep the recipe target as a mission ticket with a small fridge mascot and ingredient chips.
- Keep board access visible without adding a start modal or extra tap.
- Balance mint, peach, blue, and berry accents so the screen feels soft and collectible rather than flat green.
- Preserve all existing controls, accessibility labels, and QA test IDs.

Phase 187 adds a compact main dock inside the first playable screen:

- Treat profile state, next-fridge timing, and recipe-book progress as small game badges instead of document rows.
- Keep the board visible on first load; the dock should not introduce a start gate.
- Use the recipe ingredient icons in the dock so collection progress feels tied to the current dish.

Phase 190 keeps the 360 x 740 minimum viewport honest:

- Compress only the smallest mobile layout so the fridge board's first row peeks into the first viewport.
- Keep the larger 390/430 layouts roomier.
- Do not hide required controls, status, or recipe progress.

## 2. Mobile Layout

Target minimum viewport: `360x740`.

```text
┌────────────────────────────────────┐
│ 오늘의 냉장고        소리 모션 정지 │
│ 김치볶음밥 미션  밥 김치 계란       │
│ 점수 0  이동 0/26  구출 0/4        │
│ 내 최고 0     첫 기록 도전         │
│ 다음 냉장고 19시간 후 / 연속 1일   │
├────────────────────────────────────┤
│ ┌────┬────┬────┬────┬────┐        │
│ │ 밥 │ 김치│ 계란│ 대파│ 두부│        │
│ ├────┼────┼────┼────┼────┤        │
│ │ ... fridge ingredient tiles ... │        │
│ └────┴────┴────┴────┴────┘        │
│                                    │
│ 앞줄을 정리하면 뒤 재료가 보여요     │
├────────────────────────────────────┤
│ 준비대  [  ][  ][  ][  ][  ][  ]   │
├────────────────────────────────────┤
│ [집게]        [냉동칸]       [힌트] │
├────────────────────────────────────┤
│ 내 최고 2,180       친구 기록 보기  │
└────────────────────────────────────┘
```

## 3. First-Time Tutorial Overlay

Use progressive hints, not a blocking tutorial.

Step 1:

- Highlight three `대파`.
- Copy: "같은 재료 3개를 준비대에 담아 정리해요."

Step 2:

- Highlight recipe strip.
- Copy: "밥+김치+계란을 모으면 오늘의 한 끼가 완성돼요."

Step 3:

- Highlight expiring ingredient.
- Copy: "시계 표시 재료는 먼저 구하면 보너스예요."

Each hint should have one clear action and disappear after action.

## 4. Component Requirements

### Header

- Height: about 48px.
- Shows title, score, pause.
- Score must not shift layout as digits change.

### Goal Strip

- Shows recipe name and ingredient icons.
- Shows rescue progress.
- Must stay visible during play.

### Fridge Board

- 5 columns.
- Stable tile sizes.
- Ingredient icon plus short label for first version.
- Expiring state: clock icon, border, label.
- Hidden back item: subtle shadow or stacked corner.

### Prep Tray

- 6 fixed slots.
- Selected ingredients animate into tray.
- Full tray warning should be visual and calm.

### Booster Row

- Three icon-led tool buttons with labels:
  - 정리집게
  - 냉동칸
  - 힌트
- Disabled state should be obvious.
- The row should feel like small kitchen tools, not plain document buttons.

### Bottom Info

- Personal best.
- Friend challenge/leaderboard entry.
- No ad button on first screen.

## 5. Result Screen

```text
┌────────────────────────────────────┐
│ 김치볶음밥 완성!                   │
│ 오늘의 냉파 점수 2,340             │
├────────────────────────────────────┤
│ 재료 정리        +800              │
│ 레시피 완성      +500              │
│ 임박 재료 구출   +320              │
│ 음식물 낭비 0    +500              │
├────────────────────────────────────┤
│ 내 최고보다 +160                   │
│ [다시 도전] [친구 기록 보기]       │
│ [참여 보상 받기]                   │
└────────────────────────────────────┘
```

Rewarded ad offer appears only after the result, as an optional secondary card:

> 광고 보고 레시피 조각 1개 더 받기

It must have a clear "괜찮아요" option.

## 6. Copy Rules

Use:

- "정리"
- "구출"
- "완성"
- "한 수만 더"
- "오늘의 냉파 점수"

Avoid:

- "실패"
- "손해"
- "또 버림"
- "랭킹 보상"
- "고득점 포인트"

## 7. Accessibility Checks

- Body text at least 16px.
- Goal and score 18-22px.
- Touch target at least 48px.
- No color-only state.
- Pause and mute accessible from play screen.
- No fast flashing combo effects.
