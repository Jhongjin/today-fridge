import { afterEach, describe, expect, it, vi } from "vitest";
import { createRuntimeTossClient, getRuntimeAppsInTossBridge } from "./runtimeTossClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";

describe("runtime Toss client", () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[bridgeGlobalKey];
  });

  it("uses the injected Apps in Toss bridge when available", async () => {
    const submitGameCenterLeaderBoardScore = vi.fn().mockResolvedValue({ statusCode: "SUCCESS" });
    (globalThis as Record<string, unknown>)[bridgeGlobalKey] = {
      submitGameCenterLeaderBoardScore
    };

    const client = createRuntimeTossClient();

    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({ ok: true });
    expect(getRuntimeAppsInTossBridge()).toBeDefined();
    expect(submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: "1700" });
  });

  it("falls back to the local mock client for browser and CI runs", async () => {
    const client = createRuntimeTossClient();

    await expect(client.getUserKey()).resolves.toBe("mock-user-key");
    await expect(client.submitLeaderboardScore(1700, "play-1")).resolves.toEqual({ ok: true });
  });
});
