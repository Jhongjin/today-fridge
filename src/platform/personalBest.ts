type ScoreStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersonalBestResult = {
  previousBest: number;
  currentBest: number;
  improved: boolean;
  delta: number;
};

export type PersonalBestRouteStep = {
  cellId: string;
  ingredientId: string;
};

export type PersonalBestRoute = {
  score: number;
  steps: PersonalBestRouteStep[];
};

const keyForBoard = (boardId: string) => `today-fridge:${boardId}:personal-best`;
const routeKeyForBoard = (boardId: string) => `today-fridge:${boardId}:personal-best-route`;

const getDefaultStorage = (): ScoreStorage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

export const readPersonalBest = (boardId: string, storage = getDefaultStorage()): number => {
  if (!storage) {
    return 0;
  }

  const rawValue = storage.getItem(keyForBoard(boardId));
  const value = Number(rawValue);

  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

export const recordPersonalBest = (
  boardId: string,
  score: number,
  storage = getDefaultStorage()
): PersonalBestResult => {
  const previousBest = readPersonalBest(boardId, storage);
  const normalizedScore = Math.max(0, Math.floor(score));
  const improved = normalizedScore > previousBest;
  const currentBest = improved ? normalizedScore : previousBest;

  if (storage && improved) {
    storage.setItem(keyForBoard(boardId), String(currentBest));
  }

  return {
    previousBest,
    currentBest,
    improved,
    delta: improved ? currentBest - previousBest : 0
  };
};

export const clearPersonalBest = (boardId: string, storage = getDefaultStorage()): void => {
  storage?.removeItem(keyForBoard(boardId));
};

const normalizeRoute = (value: Partial<PersonalBestRoute>): PersonalBestRoute | null => {
  if (!Number.isFinite(value.score) || Number(value.score) <= 0 || !Array.isArray(value.steps)) {
    return null;
  }

  const steps = value.steps.filter(
    (step) => typeof step.cellId === "string" && step.cellId.length > 0 && typeof step.ingredientId === "string"
  );

  if (steps.length === 0) {
    return null;
  }

  return {
    score: Math.floor(Number(value.score)),
    steps
  };
};

export const readPersonalBestRoute = (boardId: string, storage = getDefaultStorage()): PersonalBestRoute | null => {
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(routeKeyForBoard(boardId));
    return rawValue ? normalizeRoute(JSON.parse(rawValue)) : null;
  } catch {
    return null;
  }
};

export const recordPersonalBestRoute = (
  boardId: string,
  route: PersonalBestRoute,
  storage = getDefaultStorage()
): PersonalBestRoute | null => {
  const normalizedRoute = normalizeRoute(route);

  if (normalizedRoute) {
    storage?.setItem(routeKeyForBoard(boardId), JSON.stringify(normalizedRoute));
  }

  return normalizedRoute;
};
