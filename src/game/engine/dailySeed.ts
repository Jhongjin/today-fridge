import type { BoardDefinition } from "../types";

const KST_REFRESH_OFFSET_HOURS = 4;
const datedSeedPattern = /^\d{4}-\d{2}-\d{2}-(.+)$/;

export const getKstDailyDateKey = (date = new Date()): string => {
  const shifted = new Date(date.getTime() + KST_REFRESH_OFFSET_HOURS * 60 * 60 * 1000);

  return shifted.toISOString().slice(0, 10);
};

export const getNextKstRefreshAt = (date = new Date()): Date => {
  const shifted = new Date(date.getTime() + KST_REFRESH_OFFSET_HOURS * 60 * 60 * 1000);
  const nextShiftedMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() + 1
  );

  return new Date(nextShiftedMidnight - KST_REFRESH_OFFSET_HOURS * 60 * 60 * 1000);
};

export const getMsUntilNextKstRefresh = (date = new Date()): number =>
  Math.max(0, getNextKstRefreshAt(date).getTime() - date.getTime());

export const applyKstDailySeed = (board: BoardDefinition, date = new Date()): BoardDefinition => {
  const seedBody = board.seed.match(datedSeedPattern)?.[1] ?? board.seed;

  return {
    ...board,
    seed: `${getKstDailyDateKey(date)}-${seedBody}`
  };
};
