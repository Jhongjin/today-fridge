import type { IngredientDefinition } from "../types";

export const ingredients: Record<string, IngredientDefinition> = {
  rice: {
    id: "rice",
    name: "밥",
    icon: "🍚",
    category: "grain",
    scoreValue: 80,
    recipeTags: ["meal", "fried_rice", "porridge"]
  },
  kimchi: {
    id: "kimchi",
    name: "김치",
    icon: "🥬",
    category: "leftover",
    scoreValue: 90,
    recipeTags: ["korean", "spicy", "stew", "fried_rice"]
  },
  egg: {
    id: "egg",
    name: "계란",
    icon: "🥚",
    category: "dairy",
    scoreValue: 70,
    recipeTags: ["quick", "protein", "fried_rice"]
  },
  green_onion: {
    id: "green_onion",
    name: "대파",
    icon: "🌿",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["aroma", "korean"]
  },
  tofu: {
    id: "tofu",
    name: "두부",
    icon: "□",
    category: "leftover",
    scoreValue: 80,
    recipeTags: ["stew", "protein", "soft"]
  },
  zucchini: {
    id: "zucchini",
    name: "애호박",
    icon: "🥒",
    category: "vegetable",
    scoreValue: 70,
    recipeTags: ["stew", "side_dish"]
  },
  mushroom: {
    id: "mushroom",
    name: "버섯",
    icon: "🍄",
    category: "vegetable",
    scoreValue: 70,
    recipeTags: ["stew", "stir_fry"]
  },
  soy_sauce: {
    id: "soy_sauce",
    name: "간장",
    icon: "🫙",
    category: "sauce",
    scoreValue: 60,
    recipeTags: ["sauce", "korean"]
  }
};

export const getIngredient = (id: string): IngredientDefinition => {
  const ingredient = ingredients[id];

  if (!ingredient) {
    throw new Error(`Unknown ingredient: ${id}`);
  }

  return ingredient;
};

