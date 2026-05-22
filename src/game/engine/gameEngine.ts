import { getRecipe } from "../data/recipes";
import type { BoardDefinition, ClearEvent, GameState, IngredientInstance } from "../types";
import { addClearPoints, emptyBreakdown, finalizeScore, SCORE } from "./scoring";

export const createInitialState = (board: BoardDefinition): GameState => ({
  board: board.cells.map((cell) => ({ ...cell })),
  tray: [],
  movesUsed: 0,
  comboIndex: 0,
  rescuedCount: 0,
  completedRecipeIds: [],
  breakdown: emptyBreakdown(),
  status: "playing",
  message: "같은 재료 3개를 담거나 김치볶음밥 재료를 모아보세요."
});

const promoteBackItem = (item?: IngredientInstance): IngredientInstance | undefined =>
  item ? { ...item } : undefined;

const takeFromCell = (state: GameState, cellId: string): { next: GameState; selected?: IngredientInstance } => {
  let selected: IngredientInstance | undefined;
  const board = state.board.map((cell) => {
    if (cell.id !== cellId || cell.blocked || !cell.front) {
      return cell;
    }

    selected = cell.front;

    return {
      ...cell,
      front: promoteBackItem(cell.back),
      back: undefined
    };
  });

  return {
    next: { ...state, board },
    selected
  };
};

const removeInstancesFromTray = (tray: IngredientInstance[], instances: IngredientInstance[]): IngredientInstance[] => {
  const idsToRemove = new Set(instances.map((instance) => instance.instanceId));

  return tray.filter((instance) => !idsToRemove.has(instance.instanceId));
};

const rescuePointsFor = (instances: IngredientInstance[]): number =>
  instances.filter((instance) => instance.state === "expiring").length * SCORE.expiringRescue;

const findRecipeClear = (state: GameState, board: BoardDefinition): ClearEvent | undefined => {
  if (state.completedRecipeIds.includes(board.mainRecipeId)) {
    return undefined;
  }

  const recipe = getRecipe(board.mainRecipeId);
  const chosen: IngredientInstance[] = [];

  for (const ingredientId of recipe.ingredientIds) {
    const instance = state.tray.find(
      (trayItem) =>
        trayItem.ingredientId === ingredientId &&
        !chosen.some((selected) => selected.instanceId === trayItem.instanceId)
    );

    if (!instance) {
      return undefined;
    }

    chosen.push(instance);
  }

  return {
    type: "recipe",
    recipeId: recipe.id,
    instances: chosen,
    points: recipe.score,
    comboIndex: state.comboIndex
  };
};

const findMatchClear = (state: GameState): ClearEvent | undefined => {
  const byIngredient = new Map<string, IngredientInstance[]>();

  for (const instance of state.tray) {
    const matches = byIngredient.get(instance.ingredientId) ?? [];
    matches.push(instance);
    byIngredient.set(instance.ingredientId, matches);
  }

  for (const [ingredientId, instances] of byIngredient.entries()) {
    if (instances.length >= 3) {
      return {
        type: "match",
        ingredientId,
        instances: instances.slice(0, 3),
        points: SCORE.matchClear,
        comboIndex: state.comboIndex
      };
    }
  }

  return undefined;
};

const applyClear = (state: GameState, board: BoardDefinition): GameState => {
  const clearEvent = findRecipeClear(state, board) ?? findMatchClear(state);

  if (!clearEvent) {
    const trayOverflow = state.tray.length >= board.traySlots;

    return {
      ...state,
      comboIndex: 0,
      status: trayOverflow ? "failed" : state.status,
      breakdown: trayOverflow ? finalizeScore(state, board.moveLimit, board.traySlots) : state.breakdown,
      message: trayOverflow ? "준비대가 가득 찼어요. 다음 판은 한 칸 여유를 남겨볼까요?" : state.message
    };
  }

  const rescueBonus = rescuePointsFor(clearEvent.instances);
  const bucket = clearEvent.type === "recipe" ? "recipePoints" : "clearPoints";
  const breakdownWithClear = addClearPoints(state.breakdown, clearEvent.points, state.comboIndex, bucket);
  const tray = removeInstancesFromTray(state.tray, clearEvent.instances);
  const completedRecipeIds =
    clearEvent.type === "recipe" ? [...state.completedRecipeIds, clearEvent.recipeId] : state.completedRecipeIds;
  const nextComboIndex = state.comboIndex + 1;

  const nextState: GameState = {
    ...state,
    tray,
    completedRecipeIds,
    rescuedCount: state.rescuedCount + clearEvent.instances.filter((instance) => instance.state === "expiring").length,
    breakdown: {
      ...breakdownWithClear,
      rescueBonus: breakdownWithClear.rescueBonus + rescueBonus
    },
    comboIndex: nextComboIndex,
    message:
      clearEvent.type === "recipe"
        ? "김치볶음밥 완성! 임박 재료까지 챙기면 점수가 더 올라요."
        : "깔끔하게 정리됐어요. 이어서 콤보를 노려보세요.",
    lastClear: clearEvent
  };

  if (completedRecipeIds.includes(board.mainRecipeId) && nextState.rescuedCount >= board.rescueTarget) {
    return {
      ...nextState,
      status: "complete",
      breakdown: finalizeScore(nextState, board.moveLimit, board.traySlots),
      message: "오늘의 냉장고 정리 완료!"
    };
  }

  return nextState;
};

export const selectIngredient = (state: GameState, board: BoardDefinition, cellId: string): GameState => {
  if (state.status !== "playing") {
    return state;
  }

  if (state.tray.length >= board.traySlots) {
    return {
      ...state,
      status: "failed",
      message: "준비대가 가득 찼어요. 한 번 더 정리해볼까요?"
    };
  }

  const { next, selected } = takeFromCell(state, cellId);

  if (!selected) {
    return state;
  }

  const afterMove: GameState = {
    ...next,
    tray: [...next.tray, selected],
    movesUsed: next.movesUsed + 1,
    message: selected.state === "expiring" ? "임박 재료를 담았어요. 빨리 정리하면 보너스예요." : "준비대에 담았어요."
  };

  if (afterMove.movesUsed > board.moveLimit) {
    return {
      ...afterMove,
      status: "failed",
      breakdown: finalizeScore(afterMove, board.moveLimit, board.traySlots),
      message: "움직임을 다 썼어요. 다음 판은 레시피를 먼저 노려볼까요?"
    };
  }

  return applyClear(afterMove, board);
};
