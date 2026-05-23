import { trackEvent } from "./analytics";
import { grantExternalReward, type ExternalRewardGrantResult } from "./externalRewardGrant";
import type { RewardWallet } from "./rewards";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export const FRIEND_CHALLENGE_COIN_REWARD = 12;

export type ShareRewardRequest = {
  rewardId: string;
  playId: string;
  boardId: string;
  coinAmount: number;
  recipePieceAmount?: number;
  recipeId?: string;
};

const rewardUnitFor = (coinAmount: number, recipePieceAmount = 0): "fridge_coin" | "recipe_piece" | "mixed" => {
  if (coinAmount > 0 && recipePieceAmount > 0) {
    return "mixed";
  }

  return recipePieceAmount > 0 ? "recipe_piece" : "fridge_coin";
};

export const shareRewardId = (boardRunKey: string) => `${boardRunKey}:share-reward`;

export const hasClaimedShareReward = (boardRunKey: string, wallet: RewardWallet): boolean =>
  wallet.claimedRewardIds.includes(shareRewardId(boardRunKey));

export const claimShareReward = (
  { boardId, coinAmount, playId, recipeId, recipePieceAmount = 0, rewardId }: ShareRewardRequest,
  storage?: RewardStorage
): ExternalRewardGrantResult => {
  const normalizedCoinAmount = Math.max(0, Math.floor(coinAmount));
  const normalizedRecipePieceAmount = Math.max(0, Math.floor(recipePieceAmount));
  const result = grantExternalReward(
    {
      rewardId,
      source: "share_reward",
      coinAmount,
      recipePieceAmount,
      recipeId,
      policy: {
        fixedAmount: true,
        userInitiated: true,
        affectsCleanRankedScore: false,
        tiedToScore: false,
        tiedToRank: false,
        tiedToWinLoss: false,
        randomOutcome: false,
        interruptsActivePlay: false
      }
    },
    storage
  );

  trackEvent("share_reward_event", {
    event_type: "sendViral",
    play_id: playId,
    board_id: boardId,
    reward_id: rewardId,
    status: result.ok ? "success" : result.reason === "DUPLICATE_REWARD_ID" ? "duplicate" : "blocked",
    error_code: result.ok ? null : result.reason,
    reward_amount: normalizedCoinAmount > 0 ? normalizedCoinAmount : normalizedRecipePieceAmount,
    reward_unit: rewardUnitFor(normalizedCoinAmount, normalizedRecipePieceAmount)
  });

  return result;
};
