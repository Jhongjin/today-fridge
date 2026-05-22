type DailyStreakStorage = Pick<Storage, "getItem" | "setItem">;

export type DailyStreak = {
  lastDateKey: string;
  streakDays: number;
};

const storageKey = "today-fridge:daily-streak";
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dayMs = 24 * 60 * 60 * 1000;

const getDefaultStorage = (): DailyStreakStorage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const isDateKey = (value: unknown): value is string => typeof value === "string" && dateKeyPattern.test(value);

const dateKeyToDay = (dateKey: string): number => Math.floor(Date.parse(`${dateKey}T00:00:00.000Z`) / dayMs);

const normalize = (value: Partial<DailyStreak> | null | undefined): DailyStreak | null => {
  if (!value || !isDateKey(value.lastDateKey)) {
    return null;
  }

  return {
    lastDateKey: value.lastDateKey,
    streakDays: Number.isFinite(value.streakDays) && Number(value.streakDays) > 0 ? Math.floor(Number(value.streakDays)) : 1
  };
};

export const readDailyStreak = (storage = getDefaultStorage()): DailyStreak | null => {
  if (!storage) {
    return null;
  }

  try {
    return normalize(JSON.parse(storage.getItem(storageKey) ?? "null"));
  } catch {
    return null;
  }
};

export const recordDailyStreak = (dateKey: string, storage = getDefaultStorage()): DailyStreak => {
  const previous = readDailyStreak(storage);
  const fallback: DailyStreak = {
    lastDateKey: dateKey,
    streakDays: 1
  };

  if (!isDateKey(dateKey)) {
    return fallback;
  }

  let next = fallback;

  if (previous?.lastDateKey === dateKey) {
    next = previous;
  } else if (previous) {
    const dayDelta = dateKeyToDay(dateKey) - dateKeyToDay(previous.lastDateKey);
    next = {
      lastDateKey: dateKey,
      streakDays: dayDelta === 1 ? previous.streakDays + 1 : 1
    };
  }

  storage?.setItem(storageKey, JSON.stringify(next));
  return next;
};
