import { beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { readExternalRewardWallet } from "./externalRewardGrant";
import { claimShareReward, hasClaimedShareReward, shareRewardId } from "./shareReward";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

describe("share reward service", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("claims a fixed non-ranked share reward once", () => {
    const storage = createMemoryStorage();
    const rewardId = shareRewardId("first-daily-board:2026-05-23");
    const request = {
      rewardId,
      playId: "play-1",
      boardId: "first-daily-board",
      coinAmount: 12,
      recipePieceAmount: 1,
      recipeId: "kimchi_fried_rice"
    };

    const first = claimShareReward(request, storage);
    const second = claimShareReward(request, storage);

    expect(first.ok).toBe(true);
    expect(second).toMatchObject({
      ok: false,
      reason: "DUPLICATE_REWARD_ID"
    });
    expect(readExternalRewardWallet(storage)).toMatchObject({
      fridgeCoins: 12,
      recipePieces: {
        kimchi_fried_rice: 1
      },
      claimedRewardIds: [rewardId]
    });
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "share_reward_event",
        properties: expect.objectContaining({
          event_type: "sendViral",
          play_id: "play-1",
          board_id: "first-daily-board",
          reward_id: rewardId,
          status: "success",
          error_code: null,
          reward_amount: 12,
          reward_unit: "mixed"
        })
      })
    );
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "share_reward_event",
        properties: expect.objectContaining({
          status: "duplicate",
          error_code: "DUPLICATE_REWARD_ID"
        })
      })
    );
    expect(shareRewardId("first-daily-board:2026-05-23")).toBe("first-daily-board:2026-05-23:share-reward");
    expect(hasClaimedShareReward("first-daily-board:2026-05-23", readExternalRewardWallet(storage))).toBe(true);
  });
});
