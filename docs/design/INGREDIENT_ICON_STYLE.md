# INGREDIENT_ICON_STYLE

## Goal

Ingredient icons should be readable in one glance on a small Toss WebView screen. The target player should be able to separate rice, kimchi, egg, tofu, green onion, zucchini, mushroom, and soy sauce without relying on tiny text or memory.

## MVP Direction

- Use familiar household food silhouettes.
- Keep the shape large and centered in each tile.
- Use one primary object per icon.
- Use strong outline or container shape for pale foods such as tofu, rice, egg, milk, and cheese.
- Keep the label visible under the icon in the MVP.
- Avoid realistic detail that disappears below 34 px.
- Avoid casino-like shine, loot-box styling, or random reward visual language.

## Board-Level Collision Rule

Within one playable board, two different ingredient IDs must not share the same icon glyph or final asset.

Allowed:

- `rice` appears many times with the same rice icon.
- `kimchi` appears many times with the same kimchi icon.

Not allowed in the same board:

- `zucchini` and `cucumber` sharing the same cucumber-like icon.
- `soy_sauce` and `sesame_oil` sharing the same bottle icon.
- `kimchi` and `spinach` sharing the same leafy icon.

This rule is covered by `src/game/data/content.test.ts`.

## State Cues

| State | Required cue |
| --- | --- |
| `fresh` | Clean white tile, standard icon, label visible. |
| `expiring` | Warm border plus `임박` badge; never color-only. |
| `frozen` | Frost/snow overlay plus cooler border; never blue-only. |
| `opened` | Open lid/corner mark. |
| `smelly` | Small scent mark plus sealed-container styling. |

## First Daily Icon Set

| Ingredient | MVP cue |
| --- | --- |
| `rice` | Rice bowl. |
| `kimchi` | Red napa/container cue. |
| `egg` | Simple oval egg. |
| `tofu` | White cube with clear border. |
| `green_onion` | Long green stalk. |
| `zucchini` | Round green slice. |
| `mushroom` | Mushroom cap. |
| `soy_sauce` | Dark sauce bottle or jar. |

## Asset Upgrade Path

The current emoji/string icons are acceptable for prototype validation. Before final Toss submission, replace them with a consistent raster or vector set:

- 128x128 source size.
- Transparent background.
- Legible at 28-34 px.
- One silhouette family, not mixed photo/emoji/sticker styles.
- Category accents may appear on the tile, not inside tiny icon details.
