import { describe, expect, it, vi } from "vitest";
import { createAppsInTossClient, TOSS_GAME_CENTER_MIN_VERSION, TOSS_GAME_USER_KEY_MIN_VERSION } from "./appsInTossClient";

describe("Apps in Toss client", () => {
  it("reads the game user hash through the game bridge", async () => {
    const getUserKeyForGame = vi.fn().mockResolvedValue({ type: "HASH", hash: "hash-user" });
    const client = createAppsInTossClient({
      getUserKeyForGame
    });

    await expect(client.getUserKey()).resolves.toBe("hash-user");
    expect(getUserKeyForGame).toHaveBeenCalledTimes(1);
  });

  it("uses the documented game user key minimum version when available", async () => {
    const getUserKeyForGame = vi.fn().mockResolvedValue({ type: "HASH", hash: "hash-user" });
    const isMinVersionSupported = vi.fn().mockReturnValue(false);
    const client = createAppsInTossClient({
      isMinVersionSupported,
      getUserKeyForGame
    });

    await expect(client.getUserKey()).resolves.toBeUndefined();
    expect(isMinVersionSupported).toHaveBeenCalledWith(TOSS_GAME_USER_KEY_MIN_VERSION);
    expect(getUserKeyForGame).not.toHaveBeenCalled();
  });

  it("treats non-hash game user key responses as unavailable", async () => {
    const client = createAppsInTossClient({
      getUserKeyForGame: vi.fn().mockResolvedValue("INVALID_CATEGORY")
    });

    await expect(client.getUserKey()).resolves.toBeUndefined();
  });

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

  it("normalizes unknown leaderboard submit status codes", async () => {
    const client = createAppsInTossClient({
      submitGameCenterLeaderBoardScore: vi.fn().mockResolvedValue({ statusCode: "UNKNOWN_STATUS" })
    });

    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_LEADERBOARD_SUBMIT_FAILED"
    });
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
