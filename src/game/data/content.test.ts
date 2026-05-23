import { describe, expect, it } from "vitest";
import { firstDailyBoard, tutorialBoard } from "./boards";
import { ingredients } from "./ingredients";
import { recipes } from "./recipes";

describe("content data", () => {
  it("contains the MVP ingredient and recipe counts", () => {
    expect(Object.keys(ingredients)).toHaveLength(24);
    expect(Object.keys(recipes)).toHaveLength(20);
  });

  it("keeps recipe ingredient references valid", () => {
    for (const recipe of Object.values(recipes)) {
      expect(recipe.name.length).toBeGreaterThan(0);
      expect(recipe.ingredientIds.length).toBeGreaterThanOrEqual(3);

      for (const ingredientId of recipe.ingredientIds) {
        expect(ingredients[ingredientId], `${recipe.id} references ${ingredientId}`).toBeDefined();
      }
    }
  });

  it("keeps board ingredient references valid", () => {
    for (const board of [firstDailyBoard, tutorialBoard]) {
      for (const cell of board.cells) {
        if (cell.front) {
          expect(ingredients[cell.front.ingredientId], `${board.id} ${cell.id} front`).toBeDefined();
        }

        if (cell.back) {
          expect(ingredients[cell.back.ingredientId], `${board.id} ${cell.id} back`).toBeDefined();
        }
      }

      expect(recipes[board.mainRecipeId]).toBeDefined();
    }
  });

  it("keeps ingredient icons distinguishable within playable boards", () => {
    for (const board of [firstDailyBoard, tutorialBoard]) {
      const iconOwners = new Map<string, string>();

      for (const cell of board.cells) {
        for (const instance of [cell.front, cell.back]) {
          if (!instance) {
            continue;
          }

          const { icon } = ingredients[instance.ingredientId];
          const owner = iconOwners.get(icon);

          expect(owner === undefined || owner === instance.ingredientId, `${board.id} reuses ${icon}`).toBe(true);
          iconOwners.set(icon, instance.ingredientId);
        }
      }
    }
  });
});
