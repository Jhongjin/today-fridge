import { describe, expect, it } from "vitest";
import { firstDailyBoard } from "../data/boards";
import { createInitialState, selectIngredient } from "./gameEngine";
import { totalScore } from "./scoring";

const play = (moves: string[]) =>
  moves.reduce((state, cellId) => selectIngredient(state, firstDailyBoard, cellId), createInitialState(firstDailyBoard));

describe("game engine", () => {
  it("starts the first daily board in playing state", () => {
    const state = createInitialState(firstDailyBoard);

    expect(state.status).toBe("playing");
    expect(state.tray).toHaveLength(0);
    expect(state.board).toHaveLength(30);
  });

  it("clears three matching ingredients", () => {
    const state = play(["D1", "E3", "B5"]);

    expect(state.tray).toHaveLength(0);
    expect(state.breakdown.clearPoints).toBe(100);
  });

  it("completes the main recipe when required ingredients are in tray", () => {
    const state = play(["A1", "B1", "C1"]);

    expect(state.completedRecipeIds).toContain("kimchi_fried_rice");
    expect(state.breakdown.recipePoints).toBe(500);
  });

  it("is deterministic for the same move sequence", () => {
    const moves = ["D1", "E3", "B5", "A1", "B1", "C1", "E5", "A6", "B6", "C6"];
    const first = play(moves);
    const second = play(moves);

    expect(first).toEqual(second);
    expect(totalScore(first.breakdown)).toBe(totalScore(second.breakdown));
  });

  it("has a verified clean completion route for the first daily board", () => {
    const state = play(["E1", "B3", "C6", "E5", "A6", "B6"]);

    expect(state.status).toBe("complete");
    expect(state.rescuedCount).toBe(4);
    expect(state.completedRecipeIds).toContain("kimchi_fried_rice");
    expect(state.breakdown.zeroWasteBonus).toBeGreaterThan(0);
    expect(totalScore(state.breakdown)).toBeGreaterThan(1000);
  });
});
