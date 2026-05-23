import { afterEach, describe, expect, it, vi } from "vitest";
import { installQaAppsInTossBridge } from "./qaTossBridge";
import { getRuntimeAppsInTossBridge } from "./runtimeTossClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";
const eventGlobalKey = "__TODAY_FRIDGE_TOSS_QA_EVENTS__";

describe("QA Toss bridge", () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[bridgeGlobalKey];
    delete (globalThis as Record<string, unknown>)[eventGlobalKey];
    vi.unstubAllGlobals();
  });

  it("installs a fake bridge only for the QA URL flag", async () => {
    vi.stubGlobal("location", {
      search: "?qa=toss-bridge"
    });

    expect(installQaAppsInTossBridge()).toBe(true);

    const bridge = getRuntimeAppsInTossBridge();
    await expect(bridge?.getUserKeyForGame?.()).resolves.toEqual({
      type: "HASH",
      hash: "qa-game-user-key"
    });
    await expect(bridge?.submitGameCenterLeaderBoardScore?.({ score: "1700" })).resolves.toEqual({
      statusCode: "SUCCESS"
    });
    await bridge?.openGameCenterLeaderboard?.();

    expect((globalThis as Record<string, unknown>)[eventGlobalKey]).toEqual([
      { type: "user-key", result: "HASH", hash: "qa-game-user-key" },
      { type: "submit", score: "1700" },
      { type: "open" }
    ]);
  });

  it("does not replace an existing bridge", () => {
    vi.stubGlobal("location", {
      search: "?qa=toss-bridge"
    });
    const existingBridge = {
      isMinVersionSupported: () => true
    };
    (globalThis as Record<string, unknown>)[bridgeGlobalKey] = existingBridge;

    expect(installQaAppsInTossBridge()).toBe(false);
    expect(getRuntimeAppsInTossBridge()).toBe(existingBridge);
  });

  it("can install a bridge that returns a submit failure", async () => {
    vi.stubGlobal("location", {
      search: "?qa=toss-bridge-error"
    });

    expect(installQaAppsInTossBridge()).toBe(true);

    const bridge = getRuntimeAppsInTossBridge();
    await expect(bridge?.submitGameCenterLeaderBoardScore?.({ score: "1700" })).resolves.toEqual({
      statusCode: "QA_SUBMIT_FAILED"
    });

    expect((globalThis as Record<string, unknown>)[eventGlobalKey]).toEqual([
      { type: "submit", score: "1700", statusCode: "QA_SUBMIT_FAILED" }
    ]);
  });

  it("stays off for normal URLs", () => {
    vi.stubGlobal("location", {
      search: ""
    });

    expect(installQaAppsInTossBridge()).toBe(false);
    expect(getRuntimeAppsInTossBridge()).toBeUndefined();
  });
});
