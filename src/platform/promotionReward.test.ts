import { beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { readExternalRewardWallet } from "./externalRewardGrant";
import {
  PROMOTION_ATTENDANCE_COIN_REWARD,
  claimFixedPromotionActionReward,
  claimPromotionReward,
  hasClaimedPromotionReward,
  promotionRewardId,
  type PromotionRewardRequest
} from "./promotionReward";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

const safeRequest = (patch: Partial<PromotionRewardRequest> = {}): PromotionRewardRequest => ({
  rewardId: "promotion:first-launch",
  promotionCode: "FIRST_LAUNCH",
  action: "first_launch",
  userInitiated: true,
  coinAmount: 20,
  ...patch
});

describe("promotion reward service", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("claims a fixed promotion reward once", () => {
    const storage = createMemoryStorage();

    const result = claimPromotionReward(safeRequest(), storage);
    const duplicate = claimPromotionReward(safeRequest(), storage);

    expect(result.ok).toBe(true);
    expect(duplicate).toMatchObject({
      ok: false,
      reason: "DUPLICATE_REWARD_ID"
    });
    expect(readExternalRewardWallet(storage)).toMatchObject({
      fridgeCoins: 20,
      claimedRewardIds: ["promotion:first-launch"]
    });
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "promotion_reward",
        properties: expect.objectContaining({
          promotion_code: "FIRST_LAUNCH",
          action: "first_launch",
          status: "success",
          error_code: null
        })
      })
    );
  });

  it("blocks score-tied promotion rewards before granting", () => {
    const storage = createMemoryStorage();

    const result = claimPromotionReward(
      safeRequest({
        rewardId: "promotion:score-prize",
        promotionCode: "SCORE_PRIZE",
        tiedToScore: true
      }),
      storage
    );

    expect(result).toEqual({
      ok: false,
      reason: "TIED_TO_SCORE"
    });
    expect(readExternalRewardWallet(storage).fridgeCoins).toBe(0);
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "promotion_reward",
        properties: expect.objectContaining({
          promotion_code: "SCORE_PRIZE",
          status: "blocked",
          error_code: "TIED_TO_SCORE"
        })
      })
    );
  });

  it("claims a fixed action promotion through the safe helper", () => {
    const storage = createMemoryStorage();
    const rewardId = promotionRewardId("ATTENDANCE_WEEK_1", "attendance");

    const result = claimFixedPromotionActionReward(
      {
        promotionCode: "ATTENDANCE_WEEK_1",
        action: "attendance"
      },
      storage
    );

    expect(result.ok).toBe(true);
    expect(readExternalRewardWallet(storage)).toMatchObject({
      fridgeCoins: PROMOTION_ATTENDANCE_COIN_REWARD,
      claimedRewardIds: [rewardId]
    });
    expect(hasClaimedPromotionReward("ATTENDANCE_WEEK_1", "attendance", readExternalRewardWallet(storage))).toBe(true);
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "promotion_reward",
        properties: expect.objectContaining({
          promotion_code: "ATTENDANCE_WEEK_1",
          action: "attendance",
          reward_id: rewardId,
          status: "success"
        })
      })
    );
  });
});
