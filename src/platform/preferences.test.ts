import { describe, expect, it, vi } from "vitest";
import {
  readMutedPreference,
  readReduceMotionPreference,
  writeMutedPreference,
  writeReduceMotionPreference
} from "./preferences";

const createStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    })
  };
};

describe("player preferences", () => {
  it("defaults quiet and reduced-motion preferences to off", () => {
    const storage = createStorage();

    expect(readMutedPreference(storage)).toBe(false);
    expect(readReduceMotionPreference(storage)).toBe(false);
  });

  it("stores muted and reduced-motion preferences together", () => {
    const storage = createStorage();

    writeMutedPreference(true, storage);
    writeReduceMotionPreference(true, storage);

    expect(readMutedPreference(storage)).toBe(true);
    expect(readReduceMotionPreference(storage)).toBe(true);
    expect(storage.setItem).toHaveBeenLastCalledWith(
      "today-fridge:preferences",
      JSON.stringify({
        muted: true,
        reduceMotion: true
      })
    );
  });

  it("ignores malformed stored preferences", () => {
    const storage = createStorage({
      "today-fridge:preferences": "not-json"
    });

    expect(readMutedPreference(storage)).toBe(false);
    expect(readReduceMotionPreference(storage)).toBe(false);
  });
});
