import { describe, expect, it, vi } from "vitest";
import { createHapticsController } from "./hapticsController";

describe("haptics controller", () => {
  it("records and forwards supported haptic events", () => {
    const vibrate = vi.fn(() => true);
    const haptics = createHapticsController(vibrate);

    haptics.play("ingredient_select");
    haptics.play("match_clear");
    haptics.play("game_resume");

    expect(haptics.getHistory()).toEqual(["ingredient_select", "match_clear", "game_resume"]);
    expect(vibrate).toHaveBeenCalledWith(8);
    expect(vibrate).toHaveBeenCalledWith([12, 20, 12]);
    expect(vibrate).toHaveBeenCalledWith(8);
  });

  it("suppresses haptics while disabled", () => {
    const vibrate = vi.fn(() => true);
    const haptics = createHapticsController(vibrate);

    haptics.setEnabled(false);
    haptics.play("round_complete");

    expect(haptics.getHistory()).toEqual([]);
    expect(vibrate).not.toHaveBeenCalled();
  });
});
