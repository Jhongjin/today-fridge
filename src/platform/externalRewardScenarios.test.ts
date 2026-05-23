import { beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { runExternalRewardQaScenarios } from "./externalRewardScenarios";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

describe("external reward QA scenarios", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("allows only fixed non-ranked rewards across share, ad, and promotion paths", () => {
    const report = runExternalRewardQaScenarios(createMemoryStorage());

    expect(report.safeForCleanRankedScore).toBe(true);
    expect(report.cleanRankedScoreDelta).toBe(0);
    expect(report.allowedRewardIds).toEqual(["qa:share:send-viral", "qa:ad:complete", "qa:promotion:first-launch"]);
    expect(report.wallet).toMatchObject({
      fridgeCoins: 45,
      recipePieces: {},
      claimedRewardIds: ["qa:share:send-viral", "qa:ad:complete", "qa:promotion:first-launch"]
    });
    expect(report.blockedReasons).toEqual([
      "AD_INTERRUPTS_ACTIVE_PLAY",
      "TIED_TO_SCORE",
      "TIED_TO_RANK",
      "TIED_TO_WIN_LOSS",
      "RANDOM_OUTCOME",
      "NOT_USER_INITIATED"
    ]);
  });

  it("emits evidence events for every external reward family", () => {
    runExternalRewardQaScenarios(createMemoryStorage());

    const eventNames = getTrackedEvents().map((event) => event.eventName);

    expect(eventNames).toContain("share_reward_event");
    expect(eventNames).toContain("rewarded_ad_complete");
    expect(eventNames).toContain("promotion_reward");
    expect(eventNames).toContain("external_reward_policy_check");
    expect(eventNames).toContain("external_reward_claim");
  });
});
