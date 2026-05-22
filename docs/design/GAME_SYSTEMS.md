# GAME_SYSTEMS

## 1. Identity

`오늘의 냉장고` is a short-session fridge-cleaning puzzle. The MVP should feel closer to goods sorting and triple-match than to a full polyomino fridge simulator.

Difficulty comes from:

- Space: limited prep tray, shelf depth, blocked items.
- Order: front items reveal back items; expiring ingredients may be hidden.
- State: fresh, expiring, frozen, opened, smelly.
- Goal: recipe targets, rescue targets, zero-waste bonuses.
- Choice: safe clears versus higher-value recipe routes.

## 2. MVP Core Loop

1. Start today's fridge.
2. Tap visible fridge items into the prep tray.
3. Three identical ingredients clear automatically.
4. Recipe combinations clear when the tray contains required ingredients.
5. Clearing front-row items reveals hidden back-row items.
6. Expiring ingredients give rescue bonuses if cleared before the round ends.
7. The round ends on goal completion, tray overflow, move limit, or optional timer mode.
8. Score is submitted to `오늘의 냉파 점수`.

## 3. Board Structure

MVP board:

- Vertical mobile layout.
- Fridge shelves: 5 columns x 6 rows visible capacity.
- Item depth: front/back layering for selected cells.
- Prep tray: 6 slots by default.
- Goal strip: recipe and rescue target shown at top.
- Booster strip: three large buttons near bottom.

Optional later board zones:

- Door shelf for sauces and drinks.
- Vegetable drawer for produce.
- Freezer row for frozen ingredients.

These zones should not enter the first tutorial unless they are visually obvious.

## 4. Ingredient Structure

```ts
type Ingredient = {
  id: string
  name: string
  category: "vegetable" | "fruit" | "meat" | "seafood" | "dairy" | "leftover" | "grain" | "sauce"
  state: "fresh" | "expiring" | "frozen" | "opened" | "smelly"
  scoreValue: number
  recipeTags: string[]
}
```

MVP categories should remain visually distinct. Start with 18-24 base ingredients, then add seasonal ingredients later.

## 5. Core Rules

- A tapped visible ingredient moves into the first empty prep tray slot.
- If the prep tray has three identical ingredients, they clear.
- If the prep tray matches an active recipe, those ingredients clear and the recipe completes.
- If the prep tray fills without any clear, the player fails or can use a recovery option.
- Clearing a front item reveals the item behind it.
- Expiring ingredients left uncleared reduce the final score.
- Frozen ingredients may require one extra action or a `냉동칸` booster in advanced boards.

## 6. Goal Types

| Goal | Example | Purpose |
| --- | --- | --- |
| Match clear | Clear 3 eggs | Basic familiarity |
| Recipe | Complete kimchi fried rice: rice, kimchi, egg | Higher-value routing |
| Rescue | Clear 5 expiring ingredients | Daily urgency |
| Zero waste | Finish with no spoiled/expired items | Mastery |
| Category | Clear 6 vegetables | Variety |

## 7. Scoring

```text
FridgeScore =
  ClearScore
+ RecipeScore
+ RescueBonus
+ ComboBonus
+ RemainingTrayBonus
+ ZeroWasteBonus
- WastePenalty
```

Recommended score components:

- Identical clear: 100.
- Recipe completion: 300-800 by complexity.
- Expiring rescue: +80 per ingredient.
- Combo chain: +20%, +40%, +60% capped.
- Remaining tray slot: +30 each at clear.
- Zero waste: +500.
- Uncleared expiring ingredient: -120.

The leaderboard should use one normalized integer score.

## 8. Difficulty Tiers

### Tier 1: Learn

- 4 ingredient types.
- 5 tray slots.
- No hidden back row.
- Same-item clears only.

### Tier 2: Daily Basic

- 6-8 ingredient types.
- 6 tray slots.
- Front/back reveal.
- One recipe target.

### Tier 3: Rescue

- Expiring ingredients.
- Rescue goal.
- Mild route planning.

### Tier 4: Recipe Routing

- Two recipe targets.
- Shared ingredients across recipes.
- Some frozen/opened items.

### Tier 5: Challenge

- More hidden items.
- Higher combo potential.
- Multiple optional goals.
- Same daily seed for fair competition.

## 9. Daily Challenge Generation

Daily seed:

```text
dailySeed = YYYY-MM-DD + region + themeSalt
```

Generation sequence:

1. Choose daily theme.
2. Choose target difficulty tier.
3. Pick one main recipe.
4. Pick rescue or category side goal.
5. Place required ingredients.
6. Add distractor ingredients and hidden back-row items.
7. Validate at least one clear path without boosters.
8. Compute expected score range.

Daily board refresh should happen at 05:00 KST.

## 10. MVP Scope

Included:

- Tutorial board.
- Daily fridge board.
- 18-24 ingredients.
- 20 recipes.
- Fresh/expiring/frozen states.
- Limited prep tray.
- Match and recipe clears.
- Daily seed generation.
- Score calculation.
- One leaderboard score.
- Three boosters.

Excluded:

- Real-time multiplayer.
- Full kitchen/cooking minigame.
- Deep fridge zone simulation.
- Real grocery list utility.
- Heavy season pass.
- Random gacha.
- 3D physics.

## 11. System Guardrails

- Players must understand why they failed.
- Every board must be solvable without boosters.
- Boosters may help but must not be required for ranked fairness.
- Time should be a pacing tool, not the primary difficulty.
- The best route should be learnable after replay, creating "one more try" motivation.

