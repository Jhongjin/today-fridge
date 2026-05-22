import { describe, expect, it } from "vitest";
import { readDailyStreak, recordDailyStreak } from "./dailyStreak";

const createStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

describe("daily streak", () => {
  it("starts a first local visit streak", () => {
    const storage = createStorage();

    expect(recordDailyStreak("2026-05-22", storage)).toEqual({
      lastDateKey: "2026-05-22",
      streakDays: 1
    });
    expect(readDailyStreak(storage)).toEqual({
      lastDateKey: "2026-05-22",
      streakDays: 1
    });
  });

  it("does not increase the streak twice on the same daily seed", () => {
    const storage = createStorage();

    recordDailyStreak("2026-05-22", storage);

    expect(recordDailyStreak("2026-05-22", storage)).toEqual({
      lastDateKey: "2026-05-22",
      streakDays: 1
    });
  });

  it("continues only across adjacent daily seeds", () => {
    const storage = createStorage();

    recordDailyStreak("2026-05-22", storage);
    expect(recordDailyStreak("2026-05-23", storage).streakDays).toBe(2);
    expect(recordDailyStreak("2026-05-25", storage)).toEqual({
      lastDateKey: "2026-05-25",
      streakDays: 1
    });
  });

  it("recovers from invalid stored data", () => {
    const storage = createStorage();
    storage.setItem("today-fridge:daily-streak", "not-json");

    expect(recordDailyStreak("2026-05-22", storage)).toEqual({
      lastDateKey: "2026-05-22",
      streakDays: 1
    });
  });
});
