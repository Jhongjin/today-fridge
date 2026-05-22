import { describe, expect, it } from "vitest";
import { createAudioController } from "./audioController";

describe("audio controller", () => {
  it("records sound events while unmuted", () => {
    const audio = createAudioController();

    audio.play("ingredient_select");
    audio.play("match_clear");

    expect(audio.getHistory()).toEqual(["ingredient_select", "match_clear"]);
  });

  it("suppresses sound events while muted", () => {
    const audio = createAudioController();

    audio.setMuted(true);
    audio.play("ingredient_select");

    expect(audio.getHistory()).toEqual([]);
  });
});

