import type { Recipe } from "../types";

export const recipes: Record<string, Recipe> = {
  kimchi_fried_rice: {
    id: "kimchi_fried_rice",
    name: "김치볶음밥",
    ingredientIds: ["rice", "kimchi", "egg"],
    difficulty: "easy",
    score: 500,
    caption: "남은 밥이 든든한 한 끼로"
  },
  tofu_soy_plate: {
    id: "tofu_soy_plate",
    name: "두부간장",
    ingredientIds: ["tofu", "soy_sauce", "green_onion"],
    difficulty: "easy",
    score: 430,
    caption: "간단하지만 깔끔한 반찬"
  }
};

export const getRecipe = (id: string): Recipe => {
  const recipe = recipes[id];

  if (!recipe) {
    throw new Error(`Unknown recipe: ${id}`);
  }

  return recipe;
};

