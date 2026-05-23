import { describe, expect, it, vi } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { cleanRankedFlags } from "./fairness";
import { createLeaderboardService, GAME_USER_KEY_UNAVAILABLE } from "./leaderboard";
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

  it("attaches score audit receipts to leaderboard analytics", async () => {
    clearTrackedEvents();
    const service = createLeaderboardService(createTossMockClient());

    await service.submit({
      playId: "play-audit",
      score: 1700,
      flags: cleanRankedFlags(),
      audit: {
        boardId: "first-daily-board",
        seed: "2026-05-22:first-daily-board",
        routeCells: "E1>B3>C6>E5>A6>B6",
        routeIngredients: "tofu>tofu>tofu>rice>kimchi>egg",
        routeLength: 6,
        movesUsed: 6,
        rescuedCount: 4,
        completedRecipes: "kimchi_fried_rice",
        scoreBreakdownReceipt: "clearPoints:100|recipePoints:500"
      }
    });

    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "leaderboard_submit",
      properties: {
        status: "success",
        board_id: "first-daily-board",
        seed: "2026-05-22:first-daily-board",
        route_cells: "E1>B3>C6>E5>A6>B6",
        route_ingredients: "tofu>tofu>tofu>rice>kimchi>egg",
        route_length: 6,
        moves_used: 6,
        rescued_count: 4,
        completed_recipes: "kimchi_fried_rice",
        score_breakdown_receipt: "clearPoints:100|recipePoints:500"
      }
    });
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

  it("skips clean leaderboard submit when the game user key is unavailable", async () => {
    clearTrackedEvents();
    const submitLeaderboardScore = vi.fn();
    const service = createLeaderboardService({
      getUserKey: vi.fn().mockResolvedValue(undefined),
      submitLeaderboardScore,
      openLeaderboard: vi.fn()
    });

    await expect(
      service.submit({
        playId: "play-no-user-key",
        score: 1700,
        flags: cleanRankedFlags()
      })
    ).resolves.toEqual({
      ok: false,
      skipped: true,
      reason: GAME_USER_KEY_UNAVAILABLE
    });

    expect(submitLeaderboardScore).not.toHaveBeenCalled();
    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "leaderboard_submit",
      properties: {
        status: "skipped",
        error_code: GAME_USER_KEY_UNAVAILABLE
      }
    });
  });

  it("allows a retry after a failed platform submit", async () => {
    clearTrackedEvents();
    const submitLeaderboardScore = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, errorCode: "NETWORK_ERROR" })
      .mockResolvedValueOnce({ ok: true });
    const service = createLeaderboardService({
      getUserKey: async () => "user",
      submitLeaderboardScore,
      openLeaderboard: vi.fn()
    });

    await expect(
      service.submit({
        playId: "play-retry",
        score: 1700,
        flags: cleanRankedFlags()
      })
    ).resolves.toEqual({ ok: false, errorCode: "NETWORK_ERROR" });
    await expect(
      service.submit({
        playId: "play-retry",
        score: 1700,
        flags: cleanRankedFlags()
      })
    ).resolves.toEqual({ ok: true });

    expect(submitLeaderboardScore).toHaveBeenCalledTimes(2);
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
