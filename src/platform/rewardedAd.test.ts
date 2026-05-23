import { beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { readExternalRewardWallet } from "./externalRewardGrant";
import { claimRewardedAdReward, type RewardedAdRewardRequest } from "./rewardedAd";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

const safeRequest = (patch: Partial<RewardedAdRewardRequest> = {}): RewardedAdRewardRequest => ({
  rewardId: "rewarded-ad:failed:daily-1",
  placement: "result_failure",
  gameState: "failed",
  userInitiated: true,
  adCompleted: true,
  coinAmount: 10,
  ...patch
});

describe("rewarded ad reward service", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("claims a fixed rewarded-ad reward only after completion", () => {
    const storage = createMemoryStorage();

    const result = claimRewardedAdReward(safeRequest(), storage);

    expect(result.ok).toBe(true);
    expect(readExternalRewardWallet(storage)).toMatchObject({
      fridgeCoins: 10,
      claimedRewardIds: ["rewarded-ad:failed:daily-1"]
    });
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "rewarded_ad_complete",
        properties: expect.objectContaining({
          placement: "result_failure",
          reward_type: "fridge_coin",
          amount: 10,
          status: "success",
          error_code: null
        })
      })
    );
  });

  it("does not grant when the ad completion event is missing", () => {
    const storage = createMemoryStorage();

    const result = claimRewardedAdReward(safeRequest({ adCompleted: false }), storage);

    expect(result).toEqual({
      ok: false,
      reason: "AD_NOT_COMPLETED"
    });
    expect(readExternalRewardWallet(storage).fridgeCoins).toBe(0);
    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "rewarded_ad_complete",
      properties: {
        status: "blocked",
        error_code: "AD_NOT_COMPLETED"
      }
    });
  });

  it("blocks rewarded ads that would interrupt active play", () => {
    const storage = createMemoryStorage();

    const result = claimRewardedAdReward(safeRequest({ gameState: "playing" }), storage);

    expect(result).toEqual({
      ok: false,
      reason: "AD_INTERRUPTS_ACTIVE_PLAY"
    });
    expect(readExternalRewardWallet(storage).fridgeCoins).toBe(0);
  });
});
