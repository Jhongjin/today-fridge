import { describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { cleanRankedFlags } from "./fairness";
import { createLeaderboardService } from "./leaderboard";
import { createTossMockClient } from "./tossMockClient";

describe("leaderboard service", () => {
  it("submits clean ranked scores once", async () => {
    clearTrackedEvents();
    const service = createLeaderboardService(createTossMockClient());

    const first = await service.submit({
      playId: "play-1",
      score: 2300,
      flags: cleanRankedFlags()
    });
    const second = await service.submit({
      playId: "play-1",
      score: 2300,
      flags: cleanRankedFlags()
    });

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({
      ok: false,
      skipped: true,
      reason: "DUPLICATE_PLAY_ID"
    });
    expect(getTrackedEvents().filter((event) => event.eventName === "leaderboard_submit")).toHaveLength(2);
  });

  it("does not submit booster-assisted scores to clean leaderboard", async () => {
    clearTrackedEvents();
    const service = createLeaderboardService(createTossMockClient());

    const result = await service.submit({
      playId: "play-2",
      score: 1800,
      flags: {
        ...cleanRankedFlags(),
        boosterUsed: true
      }
    });

    expect(result).toEqual({
      ok: false,
      skipped: true,
      reason: "BOOSTER_USED"
    });
    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "leaderboard_submit",
      properties: {
        status: "skipped",
        error_code: "BOOSTER_USED"
      }
    });
  });

  it("opens the leaderboard and tracks the source", async () => {
    clearTrackedEvents();
    const service = createLeaderboardService(createTossMockClient());

    await expect(service.open("result_panel")).resolves.toEqual({ ok: true });

    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "leaderboard_open",
      properties: {
        source: "result_panel",
        status: "success"
      }
    });
  });
});
