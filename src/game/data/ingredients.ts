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
  tofu: {
    id: "tofu",
    name: "두부",
    icon: "□",
    category: "leftover",
    scoreValue: 80,
    recipeTags: ["stew", "protein", "soft"]
  },
  green_onion: {
    id: "green_onion",
    name: "대파",
    icon: "🌿",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["aroma", "korean"]
  },
  onion: {
    id: "onion",
    name: "양파",
    icon: "🧅",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["aroma", "stir_fry"]
  },
  carrot: {
    id: "carrot",
    name: "당근",
    icon: "🥕",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["stir_fry", "curry", "color"]
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
  bean_sprout: {
    id: "bean_sprout",
    name: "콩나물",
    icon: "🌱",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["soup", "side_dish"]
  },
  spinach: {
    id: "spinach",
    name: "시금치",
    icon: "🥬",
    category: "vegetable",
    scoreValue: 70,
    recipeTags: ["side_dish", "green"]
  },
  cucumber: {
    id: "cucumber",
    name: "오이",
    icon: "🥒",
    category: "vegetable",
    scoreValue: 60,
    recipeTags: ["salad", "side_dish"]
  },
  pork: {
    id: "pork",
    name: "돼지고기",
    icon: "🥩",
    category: "meat",
    scoreValue: 100,
    recipeTags: ["protein", "stir_fry", "stew"]
  },
  chicken: {
    id: "chicken",
    name: "닭고기",
    icon: "🍗",
    category: "meat",
    scoreValue: 100,
    recipeTags: ["protein", "curry", "meal"]
  },
  anchovy: {
    id: "anchovy",
    name: "멸치",
    icon: "🐟",
    category: "seafood",
    scoreValue: 80,
    recipeTags: ["broth", "side_dish"]
  },
  seaweed: {
    id: "seaweed",
    name: "김",
    icon: "◼",
    category: "leftover",
    scoreValue: 60,
    recipeTags: ["rice_ball", "quick"]
  },
  milk: {
    id: "milk",
    name: "우유",
    icon: "🥛",
    category: "dairy",
    scoreValue: 70,
    recipeTags: ["drink", "breakfast"]
  },
  cheese: {
    id: "cheese",
    name: "치즈",
    icon: "🧀",
    category: "dairy",
    scoreValue: 80,
    recipeTags: ["snack", "fusion"]
  },
  apple: {
    id: "apple",
    name: "사과",
    icon: "🍎",
    category: "fruit",
    scoreValue: 70,
    recipeTags: ["fruit", "snack"]
  },
  banana: {
    id: "banana",
    name: "바나나",
    icon: "🍌",
    category: "fruit",
    scoreValue: 70,
    recipeTags: ["fruit", "snack"]
  },
  gochujang: {
    id: "gochujang",
    name: "고추장",
    icon: "🌶️",
    category: "sauce",
    scoreValue: 60,
    recipeTags: ["spicy", "sauce"]
  },
  soy_sauce: {
    id: "soy_sauce",
    name: "간장",
    icon: "🫙",
    category: "sauce",
    scoreValue: 60,
    recipeTags: ["sauce", "korean"]
  },
  doenjang: {
    id: "doenjang",
    name: "된장",
    icon: "🟤",
    category: "sauce",
    scoreValue: 70,
    recipeTags: ["stew", "korean"]
  },
  sesame_oil: {
    id: "sesame_oil",
    name: "참기름",
    icon: "🫙",
    category: "sauce",
    scoreValue: 70,
    recipeTags: ["aroma", "finisher"]
  }
};

export const getIngredient = (id: string): IngredientDefinition => {
  const ingredient = ingredients[id];

  if (!ingredient) {
    throw new Error(`Unknown ingredient: ${id}`);
  }

  return ingredient;
};

