import { beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { grantExternalReward, readExternalRewardWallet } from "./externalRewardGrant";
import type { ExternalRewardGrantRequest } from "./externalRewardGrant";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

const safeGrant = (patch: Partial<ExternalRewardGrantRequest> = {}): ExternalRewardGrantRequest => ({
  rewardId: "share-reward:daily-1",
  source: "share_reward",
  coinAmount: 15,
  recipePieceAmount: 1,
  recipeId: "kimchi_fried_rice",
  policy: {
    fixedAmount: true,
    userInitiated: true,
    affectsCleanRankedScore: false,
    tiedToScore: false,
    tiedToRank: false,
    tiedToWinLoss: false,
    randomOutcome: false,
    interruptsActivePlay: false
  },
  ...patch
});

describe("external reward grant", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("grants a policy-safe fixed external reward once", () => {
    const storage = createMemoryStorage();

    const result = grantExternalReward(safeGrant(), storage);
    const duplicate = grantExternalReward(safeGrant(), storage);

    expect(result.ok).toBe(true);
    expect(result.result).toMatchObject({
      claimed: true,
      coinAmount: 15,
      recipePieceAmount: 1
    });
    expect(duplicate).toMatchObject({
      ok: false,
      reason: "DUPLICATE_REWARD_ID"
    });
    expect(readExternalRewardWallet(storage)).toMatchObject({
      fridgeCoins: 15,
      recipePieces: {
        kimchi_fried_rice: 1
      },
      claimedRewardIds: ["share-reward:daily-1"]
    });
    expect(getTrackedEvents().map((event) => event.eventName)).toEqual([
      "external_reward_policy_check",
      "external_reward_claim",
      "external_reward_policy_check",
      "external_reward_claim"
    ]);
  });

  it("blocks unsafe external rewards before touching the wallet", () => {
    const storage = createMemoryStorage();

    const result = grantExternalReward(
      safeGrant({
        rewardId: "promotion:score-prize",
        source: "promotion_point",
        policy: {
          ...safeGrant().policy,
          tiedToScore: true
        }
      }),
      storage
    );

    expect(result).toEqual({
      ok: false,
      reason: "TIED_TO_SCORE"
    });
    expect(readExternalRewardWallet(storage)).toEqual({
      fridgeCoins: 0,
      recipePieces: {},
      claimedRewardIds: []
    });
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "external_reward_policy_check",
        properties: expect.objectContaining({
          reward_id: "promotion:score-prize",
          source: "promotion_point",
          allowed: false,
          reason: "TIED_TO_SCORE"
        })
      })
    );
  });
});
