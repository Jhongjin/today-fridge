import type { BoardCell, BoardDefinition, IngredientInstance, IngredientState } from "../types";

const item = (ingredientId: string, index: number, state: IngredientState = "fresh"): IngredientInstance => ({
  instanceId: `${ingredientId}_${index}_${state}`,
  ingredientId,
  state
});

const cell = (
  id: string,
  front?: IngredientInstance,
  back?: IngredientInstance,
  blocked = false
): BoardCell => ({
  id,
  front,
  back,
  blocked
});

export const firstDailyBoard: BoardDefinition = {
  id: "daily_001_kimchi_fried_rice",
  seed: "2026-05-22-KR-kimchi-rescue-v1",
  title: "오늘의 김치볶음밥 냉파",
  traySlots: 6,
  moveLimit: 26,
  mainRecipeId: "kimchi_fried_rice",
  rescueTarget: 4,
  cells: [
    cell("A1", item("rice", 1)),
    cell("B1", item("kimchi", 1)),
    cell("C1", item("egg", 1)),
    cell("D1", item("green_onion", 1)),
    cell("E1", item("tofu", 1)),
    cell("A2", item("zucchini", 1)),
    cell("B2", item("mushroom", 1), item("rice", 2)),
    cell("C2", item("soy_sauce", 1)),
    cell("D2", item("rice", 3)),
    cell("E2", item("kimchi", 2)),
    cell("A3", item("egg", 2)),
    cell("B3", item("tofu", 2)),
    cell("C3", item("zucchini", 2), item("kimchi", 3)),
    cell("D3", item("mushroom", 2)),
    cell("E3", item("green_onion", 2)),
    cell("A4", item("kimchi", 4)),
    cell("B4", item("soy_sauce", 2)),
    cell("C4", item("rice", 4)),
    cell("D4", item("egg", 3), item("egg", 4)),
    cell("E4", item("zucchini", 3)),
    cell("A5", item("mushroom", 3), item("soy_sauce", 3)),
    cell("B5", item("green_onion", 3)),
    cell("C5", item("soy_sauce", 4)),
    cell("D5", item("tofu", 3)),
    cell("E5", item("rice", 5, "expiring")),
    cell("A6", item("kimchi", 5, "expiring")),
    cell("B6", item("egg", 5, "expiring")),
    cell("C6", item("tofu", 4, "expiring")),
    cell("D6", undefined, undefined, true),
    cell("E6", undefined, undefined, true)
  ]
};

