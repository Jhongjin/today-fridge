import { describe, expect, it, vi } from "vitest";
import { createAppsInTossClient, TOSS_GAME_CENTER_MIN_VERSION } from "./appsInTossClient";

describe("Apps in Toss client", () => {
  it("submits integer scores as strings through the game center bridge", async () => {
    const submitGameCenterLeaderBoardScore = vi.fn().mockResolvedValue({ statusCode: "SUCCESS" });
    const client = createAppsInTossClient({
      submitGameCenterLeaderBoardScore
    });

    await expect(client.submitLeaderboardScore(1700.9, "play-1")).resolves.toEqual({ ok: true });
    expect(submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: "1700" });
  });

  it("checks the documented minimum Toss app version when available", async () => {
    const submitGameCenterLeaderBoardScore = vi.fn().mockResolvedValue({ statusCode: "SUCCESS" });
    const isMinVersionSupported = vi.fn().mockReturnValue(false);
    const client = createAppsInTossClient({
      isMinVersionSupported,
      submitGameCenterLeaderBoardScore
    });

    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_VERSION_UNSUPPORTED"
    });
    expect(isMinVersionSupported).toHaveBeenCalledWith(TOSS_GAME_CENTER_MIN_VERSION);
    expect(submitGameCenterLeaderBoardScore).not.toHaveBeenCalled();
  });

  it("opens leaderboard only when the bridge exists and is supported", async () => {
    const openGameCenterLeaderboard = vi.fn().mockResolvedValue(undefined);
    const client = createAppsInTossClient({
      isMinVersionSupported: vi.fn().mockReturnValue(true),
      openGameCenterLeaderboard
    });

    await client.openLeaderboard();

    expect(openGameCenterLeaderboard).toHaveBeenCalledTimes(1);
  });
});
