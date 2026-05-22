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
  doenjang_stew: {
    id: "doenjang_stew",
    name: "된장찌개",
    ingredientIds: ["doenjang", "tofu", "zucchini"],
    difficulty: "easy",
    score: 500,
    caption: "냉장고 속 기본 찌개"
  },
  egg_rice: {
    id: "egg_rice",
    name: "계란밥",
    ingredientIds: ["rice", "egg", "sesame_oil"],
    difficulty: "easy",
    score: 420,
    caption: "빠르고 고소한 한 그릇"
  },
  tofu_soy_plate: {
    id: "tofu_soy_plate",
    name: "두부간장",
    ingredientIds: ["tofu", "soy_sauce", "green_onion"],
    difficulty: "easy",
    score: 430,
    caption: "간단하지만 깔끔한 반찬"
  },
  mushroom_stir_fry: {
    id: "mushroom_stir_fry",
    name: "버섯볶음",
    ingredientIds: ["mushroom", "onion", "soy_sauce"],
    difficulty: "easy",
    score: 450,
    caption: "자투리 채소 정리"
  },
  zucchini_side: {
    id: "zucchini_side",
    name: "애호박볶음",
    ingredientIds: ["zucchini", "green_onion", "soy_sauce"],
    difficulty: "easy",
    score: 450,
    caption: "초록 반찬 하나 완성"
  },
  bean_sprout_soup: {
    id: "bean_sprout_soup",
    name: "콩나물국",
    ingredientIds: ["bean_sprout", "green_onion", "anchovy"],
    difficulty: "normal",
    score: 560,
    caption: "시원하게 끓이는 기본 국"
  },
  kimchi_stew: {
    id: "kimchi_stew",
    name: "김치찌개",
    ingredientIds: ["kimchi", "pork", "tofu"],
    difficulty: "normal",
    score: 650,
    caption: "남은 김치의 정석"
  },
  chicken_curry: {
    id: "chicken_curry",
    name: "닭고기카레",
    ingredientIds: ["chicken", "carrot", "onion"],
    difficulty: "normal",
    score: 620,
    caption: "냉장고 채소를 한 번에"
  },
  pork_stir_fry: {
    id: "pork_stir_fry",
    name: "돼지고기볶음",
    ingredientIds: ["pork", "gochujang", "onion"],
    difficulty: "normal",
    score: 650,
    caption: "매콤하게 점수도 든든"
  },
  spinach_side: {
    id: "spinach_side",
    name: "시금치나물",
    ingredientIds: ["spinach", "soy_sauce", "sesame_oil"],
    difficulty: "easy",
    score: 470,
    caption: "잎채소를 놓치기 전에"
  },
  cucumber_side: {
    id: "cucumber_side",
    name: "오이무침",
    ingredientIds: ["cucumber", "gochujang", "sesame_oil"],
    difficulty: "easy",
    score: 470,
    caption: "아삭하게 한 접시"
  },
  rice_ball: {
    id: "rice_ball",
    name: "김주먹밥",
    ingredientIds: ["rice", "seaweed", "sesame_oil"],
    difficulty: "easy",
    score: 430,
    caption: "남은 밥 빠른 정리"
  },
  tofu_stew_light: {
    id: "tofu_stew_light",
    name: "순한 두부찌개",
    ingredientIds: ["tofu", "mushroom", "green_onion"],
    difficulty: "normal",
    score: 540,
    caption: "부담 없는 따뜻한 한 끼"
  },
  fried_egg_plate: {
    id: "fried_egg_plate",
    name: "계란반찬",
    ingredientIds: ["egg", "soy_sauce", "green_onion"],
    difficulty: "easy",
    score: 420,
    caption: "냉장고 기본템 클리어"
  },
  fruit_snack: {
    id: "fruit_snack",
    name: "과일간식",
    ingredientIds: ["apple", "banana", "milk"],
    difficulty: "easy",
    score: 420,
    caption: "간단한 간식 완성"
  },
  cheese_egg: {
    id: "cheese_egg",
    name: "치즈계란",
    ingredientIds: ["cheese", "egg", "green_onion"],
    difficulty: "normal",
    score: 520,
    caption: "익숙한 재료의 작은 변주"
  },
  seaweed_soup_hint: {
    id: "seaweed_soup_hint",
    name: "간단 국물",
    ingredientIds: ["anchovy", "green_onion", "soy_sauce"],
    difficulty: "normal",
    score: 500,
    caption: "국물 베이스 정리"
  },
  kimchi_tofu: {
    id: "kimchi_tofu",
    name: "김치두부",
    ingredientIds: ["kimchi", "tofu", "sesame_oil"],
    difficulty: "normal",
    score: 540,
    caption: "남은 반찬이 새 반찬으로"
  },
  vegetable_mix: {
    id: "vegetable_mix",
    name: "채소모음볶음",
    ingredientIds: ["carrot", "onion", "zucchini"],
    difficulty: "normal",
    score: 560,
    caption: "색깔 채소를 한 번에"
  }
};

export const getRecipe = (id: string): Recipe => {
  const recipe = recipes[id];

  if (!recipe) {
    throw new Error(`Unknown recipe: ${id}`);
  }

  return recipe;
};

