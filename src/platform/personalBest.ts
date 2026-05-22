type ScoreStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersonalBestResult = {
  previousBest: number;
  currentBest: number;
  improved: boolean;
  delta: number;
};

const keyForBoard = (boardId: string) => `today-fridge:${boardId}:personal-best`;

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
