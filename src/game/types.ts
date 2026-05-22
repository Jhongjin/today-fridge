export type IngredientCategory =
  | "vegetable"
  | "fruit"
  | "meat"
  | "seafood"
  | "dairy"
  | "leftover"
  | "grain"
  | "sauce";

export type IngredientState = "fresh" | "expiring" | "frozen" | "opened" | "smelly";

export type IngredientDefinition = {
  id: string;
  name: string;
  icon: string;
  category: IngredientCategory;
  scoreValue: number;
  recipeTags: string[];
};

export type IngredientInstance = {
  instanceId: string;
  ingredientId: string;
  state: IngredientState;
};

export type Recipe = {
  id: string;
  name: string;
  ingredientIds: string[];
  difficulty: "easy" | "normal" | "tricky";
  score: number;
  caption: string;
};

export type BoardCell = {
  id: string;
  front?: IngredientInstance;
  back?: IngredientInstance;
  blocked?: boolean;
};

export type BoardDefinition = {
  id: string;
  seed: string;
  title: string;
  traySlots: number;
  moveLimit: number;
  mainRecipeId: string;
  rescueTarget: number;
  cells: BoardCell[];
};

export type ScoreBreakdown = {
  clearPoints: number;
  recipePoints: number;
  rescueBonus: number;
  comboBonus: number;
  remainingTrayBonus: number;
  zeroWasteBonus: number;
  moveEfficiencyBonus: number;
  wastePenalty: number;
};

export type RoundStatus = "playing" | "complete" | "failed";

export type ClearEvent =
  | {
      type: "match";
      ingredientId: string;
      instances: IngredientInstance[];
      points: number;
      comboIndex: number;
    }
  | {
      type: "recipe";
      recipeId: string;
      instances: IngredientInstance[];
      points: number;
      comboIndex: number;
    };

export type GameState = {
  board: BoardCell[];
  tray: IngredientInstance[];
  movesUsed: number;
  comboIndex: number;
  rescuedCount: number;
  completedRecipeIds: string[];
  breakdown: ScoreBreakdown;
  status: RoundStatus;
  message: string;
  lastClear?: ClearEvent;
};

