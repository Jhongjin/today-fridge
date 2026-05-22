import { describe, expect, it } from "vitest";
import { scoreTierFor } from "./scoreTier";

describe("score tiers", () => {
  it.each([
    [1700, "S"],
    [1400, "A"],
    [1000, "B"],
    [999, "C"]
  ] as const)("maps clean score %i to tier %s", (score, tier) => {
    expect(
      scoreTierFor({
        cleanRun: true,
        score,
        status: "complete"
      })
    ).toBe(tier);
  });

  it("marks booster-assisted completions as practice", () => {
    expect(
      scoreTierFor({
        cleanRun: false,
        score: 1700,
        status: "complete"
      })
    ).toBe("연습");
  });

  it("marks failed rounds separately from low scores", () => {
    expect(
      scoreTierFor({
        cleanRun: true,
        score: 0,
        status: "failed"
      })
    ).toBe("아쉬움");
  });
});
