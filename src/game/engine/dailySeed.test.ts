import { describe, expect, it } from "vitest";
import { firstDailyBoard } from "../data/boards";
import { applyKstDailySeed, getKstDailyDateKey } from "./dailySeed";

describe("daily seed", () => {
  it("refreshes at 05:00 KST", () => {
    expect(getKstDailyDateKey(new Date("2026-05-21T19:59:59.000Z"))).toBe("2026-05-21");
    expect(getKstDailyDateKey(new Date("2026-05-21T20:00:00.000Z"))).toBe("2026-05-22");
  });

  it("preserves the board seed body while replacing the daily date", () => {
    const board = applyKstDailySeed(firstDailyBoard, new Date("2026-06-01T00:00:00.000Z"));

    expect(board.seed).toBe("2026-06-01-KR-kimchi-rescue-v1");
    expect(board.cells).toBe(firstDailyBoard.cells);
  });
});
