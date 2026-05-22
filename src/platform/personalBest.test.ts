import { describe, expect, it } from "vitest";
import { readPersonalBest, recordPersonalBest } from "./personalBest";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    }
  };
};

describe("personal best", () => {
  it("stores a higher score as the board best", () => {
    const storage = createMemoryStorage();

    const result = recordPersonalBest("daily-1", 1700, storage);

    expect(result).toEqual({
      previousBest: 0,
      currentBest: 1700,
      improved: true,
      delta: 1700
    });
    expect(readPersonalBest("daily-1", storage)).toBe(1700);
  });

  it("keeps the prior best when the new score is lower", () => {
    const storage = createMemoryStorage();

    recordPersonalBest("daily-1", 1700, storage);
    const result = recordPersonalBest("daily-1", 1200, storage);

    expect(result).toEqual({
      previousBest: 1700,
      currentBest: 1700,
      improved: false,
      delta: 0
    });
    expect(readPersonalBest("daily-1", storage)).toBe(1700);
  });

  it("keeps separate best scores for different daily keys", () => {
    const storage = createMemoryStorage();

    recordPersonalBest("daily-1:2026-05-22", 1700, storage);
    recordPersonalBest("daily-1:2026-05-23", 900, storage);

    expect(readPersonalBest("daily-1:2026-05-22", storage)).toBe(1700);
    expect(readPersonalBest("daily-1:2026-05-23", storage)).toBe(900);
  });
});
