# INGREDIENTS

## 1. MVP Ingredient Principle

The first playable version uses familiar Korean household ingredients with clear silhouettes and short names.

Selection rules:

- Recognizable at small mobile size.
- Useful in multiple recipes.
- Easy to categorize visually.
- Not too similar in color and shape.
- Supports rescue, recipe, and combo scoring.

## 2. MVP Ingredient States

| State | Meaning | Visual Cue | Scoring |
| --- | --- | --- | --- |
| `fresh` | Normal ingredient | Clean tile | Base score |
| `expiring` | Should be rescued today | Clock icon, warm border, "임박" label | +80 if cleared, -120 if left |
| `frozen` | Needs thaw or freezer helper | Frost overlay, snow icon | Can clear in advanced boards |
| `opened` | Used leftover or opened package | Open lid/corner mark | Recipe-friendly, lower base value |
| `smelly` | Needs careful clearing | Small scent icon, sealed container art | Higher risk, later tier |

MVP tutorial uses only `fresh`. First daily board uses `fresh` and `expiring`.

## 3. Base Ingredients

| ID | Korean Name | Category | Base Value | Shape Cue | Recipe Tags |
| --- | --- | --- | ---: | --- | --- |
| `rice` | 밥 | `grain` | 80 | Bowl | `meal`, `fried_rice`, `porridge` |
| `kimchi` | 김치 | `leftover` | 90 | Red container | `korean`, `spicy`, `stew`, `fried_rice` |
| `egg` | 계란 | `dairy` | 70 | Oval | `quick`, `protein`, `fried_rice` |
| `tofu` | 두부 | `leftover` | 80 | White cube | `stew`, `protein`, `soft` |
| `green_onion` | 대파 | `vegetable` | 60 | Long green | `aroma`, `korean` |
| `onion` | 양파 | `vegetable` | 60 | Round pale | `aroma`, `stir_fry` |
| `carrot` | 당근 | `vegetable` | 60 | Orange stick | `stir_fry`, `curry`, `color` |
| `zucchini` | 애호박 | `vegetable` | 70 | Green half-moon | `stew`, `side_dish` |
| `mushroom` | 버섯 | `vegetable` | 70 | Cap | `stew`, `stir_fry` |
| `bean_sprout` | 콩나물 | `vegetable` | 60 | Sprout bundle | `soup`, `side_dish` |
| `spinach` | 시금치 | `vegetable` | 70 | Leaf bunch | `side_dish`, `green` |
| `cucumber` | 오이 | `vegetable` | 60 | Long green | `salad`, `side_dish` |
| `pork` | 돼지고기 | `meat` | 100 | Pink slice | `protein`, `stir_fry`, `stew` |
| `chicken` | 닭고기 | `meat` | 100 | Drum/slice | `protein`, `curry`, `meal` |
| `anchovy` | 멸치 | `seafood` | 80 | Small fish | `broth`, `side_dish` |
| `seaweed` | 김 | `leftover` | 60 | Black sheet | `rice_ball`, `quick` |
| `milk` | 우유 | `dairy` | 70 | Carton | `drink`, `breakfast` |
| `cheese` | 치즈 | `dairy` | 80 | Yellow square | `snack`, `fusion` |
| `apple` | 사과 | `fruit` | 70 | Red fruit | `fruit`, `snack` |
| `banana` | 바나나 | `fruit` | 70 | Yellow curve | `fruit`, `snack` |
| `gochujang` | 고추장 | `sauce` | 60 | Red tube/jar | `spicy`, `sauce` |
| `soy_sauce` | 간장 | `sauce` | 60 | Dark bottle | `sauce`, `korean` |
| `doenjang` | 된장 | `sauce` | 70 | Brown tub | `stew`, `korean` |
| `sesame_oil` | 참기름 | `sauce` | 70 | Small bottle | `aroma`, `finisher` |

## 4. Tutorial Ingredient Set

Use only four ingredients:

- 밥
- 김치
- 계란
- 대파

Tutorial goal:

> 같은 재료 3개를 정리하고, 밥+김치+계란으로 김치볶음밥을 완성한다.

## 5. First Daily Ingredient Set

Use eight ingredients:

- 밥
- 김치
- 계란
- 대파
- 두부
- 애호박
- 버섯
- 간장

Rationale:

- Familiar.
- Strong recipe association.
- Clear colors and silhouettes.
- Supports both match clears and recipe clears.

## 6. Visual Distinction Rules

- Similar green ingredients must differ by silhouette: 대파 is long, 애호박 is round slice, 시금치는 leafy.
- Sauce bottles must have clear shape and labels.
- Expiring state must add a clock icon and not only red color.
- Frozen state must add frost and not only blue color.
- Text label should be visible on first encounter and optional after familiarity.

