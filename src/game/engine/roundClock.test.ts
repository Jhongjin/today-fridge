import { describe, expect, it } from "vitest";
import { activeRoundDurationMs, pausedDurationMs } from "./roundClock";

describe("round clock", () => {
  it("subtracts completed pause spans from active duration", () => {
    expect(
      activeRoundDurationMs({
        nowMs: 10_000,
        startedAtMs: 1_000,
        totalPausedMs: 3_500
      })
    ).toBe(5_500);
  });

  it("subtracts the current open pause span", () => {
    expect(
      activeRoundDurationMs({
        nowMs: 10_000,
        startedAtMs: 1_000,
        totalPausedMs: 2_000,
        pausedStartedAtMs: 8_000
      })
    ).toBe(5_000);
  });

  it("never returns negative active duration", () => {
    expect(
      activeRoundDurationMs({
        nowMs: 1_000,
        startedAtMs: 10_000,
        totalPausedMs: 2_000
      })
    ).toBe(0);
  });

  it("measures only valid paused spans", () => {
    expect(pausedDurationMs(null, 10_000)).toBe(0);
    expect(pausedDurationMs(10_000, 9_000)).toBe(0);
    expect(pausedDurationMs(7_000, 10_000)).toBe(3_000);
  });
});
