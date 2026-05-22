import { describe, expect, it } from "vitest";
import { createWebAudioOutput } from "./webAudioOutput";

describe("web audio output", () => {
  it("is safe when Web Audio is unavailable", () => {
    const output = createWebAudioOutput();

    expect(() => output.play("ingredient_select")).not.toThrow();
  });
});
