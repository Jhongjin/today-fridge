import { afterEach, describe, expect, it, vi } from "vitest";
import { createRuntimeTossClient, getRuntimeAppsInTossBridge } from "./runtimeTossClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";

describe("runtime Toss client", () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[bridgeGlobalKey];
  });

  it("uses the injected Apps in Toss bridge when available", async () => {
    const getUserKeyForGame = vi.fn().mockResolvedValue({ type: "HASH", hash: "hash-user" });
    const submitGameCenterLeaderBoardScore = vi.fn().mockResolvedValue({ statusCode: "SUCCESS" });
    (globalThis as Record<string, unknown>)[bridgeGlobalKey] = {
      getUserKeyForGame,
      submitGameCenterLeaderBoardScore
    };

    const client = createRuntimeTossClient();

    await expect(client.getUserKey()).resolves.toBe("hash-user");
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({ ok: true });
    expect(getRuntimeAppsInTossBridge()).toBeDefined();
    expect(getUserKeyForGame).toHaveBeenCalledTimes(1);
    expect(submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: "1700" });
  });

  it("keeps the injected bridge ahead of the real SDK opt-in", async () => {
    const loadRealClient = vi.fn();
    (globalThis as Record<string, unknown>)[bridgeGlobalKey] = {
      getUserKeyForGame: vi.fn().mockResolvedValue({ type: "HASH", hash: "bridge-user" })
    };

    const client = createRuntimeTossClient({
      realClientEnabled: true,
      loadRealClient
    });

    await expect(client.getUserKey()).resolves.toBe("bridge-user");
    expect(loadRealClient).not.toHaveBeenCalled();
  });

  it("can opt into the lazily loaded real Toss client", async () => {
    const realClient = {
      getUserKey: vi.fn().mockResolvedValue("real-user"),
      submitLeaderboardScore: vi.fn().mockResolvedValue({ ok: true }),
      openLeaderboard: vi.fn().mockResolvedValue(undefined)
    };
    const loadRealClient = vi.fn().mockResolvedValue(realClient);
    const client = createRuntimeTossClient({
      realClientEnabled: true,
      loadRealClient
    });

    await expect(client.getUserKey()).resolves.toBe("real-user");
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({ ok: true });
    await expect(client.openLeaderboard()).resolves.toBeUndefined();

    expect(loadRealClient).toHaveBeenCalledTimes(1);
    expect(realClient.submitLeaderboardScore).toHaveBeenCalledWith(1700, "play-1");
    expect(realClient.openLeaderboard).toHaveBeenCalledTimes(1);
  });

  it("fails closed if the real client cannot load", async () => {
    const loadRealClient = vi.fn().mockRejectedValue(new Error("missing runtime"));
    const client = createRuntimeTossClient({
      realClientEnabled: true,
      loadRealClient
    });

    await expect(client.getUserKey()).resolves.toBeUndefined();
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_SDK_UNAVAILABLE"
    });
    await expect(client.openLeaderboard()).rejects.toThrow("missing runtime");
    expect(loadRealClient).toHaveBeenCalledTimes(3);
  });

  it("falls back to the local mock client for browser and CI runs", async () => {
    const client = createRuntimeTossClient();

    await expect(client.getUserKey()).resolves.toBe("mock-user-key");
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({ ok: true });
  });
});
