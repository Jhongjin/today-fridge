import { describe, expect, it, vi } from "vitest";
import { TOSS_GAME_CENTER_MIN_VERSION, TOSS_GAME_USER_KEY_MIN_VERSION } from "./appsInTossClient";
import { createTossRealClient, type AppsInTossSdk } from "./tossRealClient";

const createFakeSdk = (patch: Partial<AppsInTossSdk> = {}): AppsInTossSdk => ({
  getUserKeyForGame: vi.fn().mockResolvedValue({ type: "HASH", hash: "real-hash" }),
  isMinVersionSupported: vi.fn().mockReturnValue(true),
  openGameCenterLeaderboard: vi.fn().mockResolvedValue(undefined),
  submitGameCenterLeaderBoardScore: vi.fn().mockResolvedValue({ statusCode: "SUCCESS" }),
  ...patch
});

describe("Toss real client", () => {
  it("wraps the official SDK shape through the shared Apps in Toss adapter", async () => {
    const sdk = createFakeSdk();
    const client = createTossRealClient(sdk);

    await expect(client.getUserKey()).resolves.toBe("real-hash");
    await expect(client.submitLeaderboardScore(1700.7, "play-1")).resolves.toEqual({ ok: true });
    await expect(client.openLeaderboard()).resolves.toBeUndefined();

    expect(sdk.isMinVersionSupported).toHaveBeenCalledWith(TOSS_GAME_USER_KEY_MIN_VERSION);
    expect(sdk.isMinVersionSupported).toHaveBeenCalledWith(TOSS_GAME_CENTER_MIN_VERSION);
    expect(sdk.submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: "1700" });
    expect(sdk.openGameCenterLeaderboard).toHaveBeenCalledTimes(1);
  });

  it("keeps unsupported Toss versions outside the official calls", async () => {
    const sdk = createFakeSdk({
      isMinVersionSupported: vi.fn().mockReturnValue(false)
    });
    const client = createTossRealClient(sdk);

    await expect(client.getUserKey()).resolves.toBeUndefined();
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_VERSION_UNSUPPORTED"
    });

    expect(sdk.getUserKeyForGame).not.toHaveBeenCalled();
    expect(sdk.submitGameCenterLeaderBoardScore).not.toHaveBeenCalled();
  });
});
