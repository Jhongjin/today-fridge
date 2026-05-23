import { describe, expect, it, vi } from "vitest";
import { createAudioController, SOUND_EVENTS } from "./audioController";

describe("audio controller", () => {
  it("exposes the locked SFX trigger list", () => {
    expect(SOUND_EVENTS).toEqual([
      "fridge_open",
      "ingredient_select",
      "match_clear",
      "recipe_complete",
      "expiring_rescue",
      "booster_use",
      "game_pause",
      "game_resume",
      "round_complete",
      "round_fail",
      "leaderboard_submit",
      "result_share"
    ]);
  });

  it("records sound events while unmuted", () => {
    const audio = createAudioController();

    audio.play("ingredient_select");
    audio.play("match_clear");
    audio.play("game_pause");

    expect(audio.getHistory()).toEqual(["ingredient_select", "match_clear", "game_pause"]);
  });

  it("forwards sound events to an output while unmuted", () => {
    const output = {
      play: vi.fn()
    };
    const audio = createAudioController(output);

    audio.play("game_resume");

    expect(output.play).toHaveBeenCalledWith("game_resume");
  });

  it("suppresses sound events while muted", () => {
    const output = {
      play: vi.fn()
    };
    const audio = createAudioController(output);

    audio.setMuted(true);
    audio.play("ingredient_select");

    expect(audio.getHistory()).toEqual([]);
    expect(output.play).not.toHaveBeenCalled();
  });

  it("suppresses sound events while suspended", () => {
    const output = {
      play: vi.fn()
    };
    const audio = createAudioController(output);

    audio.setSuspended(true);
    audio.play("ingredient_select");

    expect(audio.isSuspended()).toBe(true);
    expect(audio.getHistory()).toEqual([]);
    expect(output.play).not.toHaveBeenCalled();
  });

  it("resumes sound events after suspension is lifted", () => {
    const output = {
      play: vi.fn()
    };
    const audio = createAudioController(output);

    audio.setSuspended(true);
    audio.setSuspended(false);
    audio.play("ingredient_select");

    expect(audio.isSuspended()).toBe(false);
    expect(audio.getHistory()).toEqual(["ingredient_select"]);
    expect(output.play).toHaveBeenCalledWith("ingredient_select");
  });
});
