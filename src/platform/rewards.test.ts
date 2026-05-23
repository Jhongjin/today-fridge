import { describe, expect, it } from "vitest";
import {
  claimFixedReward,
  claimCompletionReward,
  claimParticipationReward,
  hasClaimedCompletionReward,
  hasClaimedParticipationReward,
  readRewardWallet
} from "./rewards";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

describe("reward wallet", () => {
  it("claims a fixed completion reward once per board", () => {
    const storage = createMemoryStorage();

    const first = claimCompletionReward("daily-1", "kimchi_fried_rice", storage);
    const second = claimCompletionReward("daily-1", "kimchi_fried_rice", storage);

    expect(first).toMatchObject({
      claimed: true,
      coinAmount: 30,
      recipePieceAmount: 1,
      wallet: {
        fridgeCoins: 30,
        recipePieces: {
          kimchi_fried_rice: 1
        }
      }
    });
    expect(second).toMatchObject({
      claimed: false,
      coinAmount: 0,
      recipePieceAmount: 0,
      wallet: {
        fridgeCoins: 30,
        recipePieces: {
          kimchi_fried_rice: 1
        }
      }
    });
    expect(hasClaimedCompletionReward("daily-1", readRewardWallet(storage))).toBe(true);
  });

  it("claims a smaller participation reward once per board", () => {
    const storage = createMemoryStorage();

    const first = claimParticipationReward("daily-1", storage);
    const second = claimParticipationReward("daily-1", storage);

    expect(first).toMatchObject({
      claimed: true,
      coinAmount: 10,
      recipePieceAmount: 0,
      wallet: {
        fridgeCoins: 10,
        recipePieces: {}
      }
    });
    expect(second).toMatchObject({
      claimed: false,
      coinAmount: 0,
      recipePieceAmount: 0,
      wallet: {
        fridgeCoins: 10,
        recipePieces: {}
      }
    });
    expect(hasClaimedParticipationReward("daily-1", readRewardWallet(storage))).toBe(true);
  });

  it("allows fixed rewards to reset across daily keys", () => {
    const storage = createMemoryStorage();

    const firstDay = claimCompletionReward("daily-1:2026-05-22", "kimchi_fried_rice", storage);
    const secondDay = claimCompletionReward("daily-1:2026-05-23", "kimchi_fried_rice", storage);

    expect(firstDay.claimed).toBe(true);
    expect(secondDay.claimed).toBe(true);
    expect(secondDay.wallet.fridgeCoins).toBe(60);
    expect(secondDay.wallet.recipePieces.kimchi_fried_rice).toBe(2);
  });

  it("claims a generic fixed reward once with normalized positive amounts", () => {
    const storage = createMemoryStorage();

    const first = claimFixedReward(
      {
        rewardId: "share-reward:daily-1",
        coinAmount: 12.9,
        recipePieceAmount: 1.8,
        recipeId: "kimchi_fried_rice"
      },
      storage
    );
    const second = claimFixedReward(
      {
        rewardId: "share-reward:daily-1",
        coinAmount: 99,
        recipePieceAmount: 99,
        recipeId: "kimchi_fried_rice"
      },
      storage
    );

    expect(first).toMatchObject({
      claimed: true,
      coinAmount: 12,
      recipePieceAmount: 1,
      wallet: {
        fridgeCoins: 12,
        recipePieces: {
          kimchi_fried_rice: 1
        }
      }
    });
    expect(second).toMatchObject({
      claimed: false,
      coinAmount: 0,
      recipePieceAmount: 0,
      wallet: {
        fridgeCoins: 12,
        recipePieces: {
          kimchi_fried_rice: 1
        }
      }
    });
  });

  it("falls back to an empty wallet when stored data is invalid", () => {
    const storage = createMemoryStorage();
    storage.setItem("today-fridge:reward-wallet", "not-json");

    expect(readRewardWallet(storage)).toEqual({
      fridgeCoins: 0,
      recipePieces: {},
      claimedRewardIds: []
    });
  });
});
