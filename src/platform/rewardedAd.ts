import { trackEvent } from "./analytics";
import { grantExternalReward, type ExternalRewardGrantResult } from "./externalRewardGrant";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type RewardedAdPlacement = "result_failure" | "result_completion" | "recipe_book";
export type RewardedAdGameState = "playing" | "complete" | "failed" | "menu";

export type RewardedAdRewardRequest = {
  rewardId: string;
  placement: RewardedAdPlacement;
  gameState: RewardedAdGameState;
  userInitiated: boolean;
  adCompleted: boolean;
  coinAmount: number;
  recipePieceAmount?: number;
  recipeId?: string;
};

const normalizedAmount = (amount: number | undefined) => (Number.isFinite(amount) && Number(amount) > 0 ? Math.floor(Number(amount)) : 0);

const rewardTypeFor = (coinAmount: number, recipePieceAmount = 0): "fridge_coin" | "recipe_piece" | "mixed" => {
  if (coinAmount > 0 && recipePieceAmount > 0) {
    return "mixed";
  }

  return recipePieceAmount > 0 ? "recipe_piece" : "fridge_coin";
};

export const claimRewardedAdReward = (
  { adCompleted, coinAmount, gameState, placement, recipeId, recipePieceAmount = 0, rewardId, userInitiated }: RewardedAdRewardRequest,
  storage?: RewardStorage
): ExternalRewardGrantResult => {
  const normalizedCoinAmount = normalizedAmount(coinAmount);
  const normalizedRecipePieceAmount = normalizedAmount(recipePieceAmount);

  if (!adCompleted) {
    trackEvent("rewarded_ad_complete", {
      placement,
      reward_type: rewardTypeFor(normalizedCoinAmount, normalizedRecipePieceAmount),
      amount: normalizedCoinAmount > 0 ? normalizedCoinAmount : normalizedRecipePieceAmount,
      status: "blocked",
      error_code: "AD_NOT_COMPLETED"
    });

    return {
      ok: false,
      reason: "AD_NOT_COMPLETED"
    };
  }

  const result = grantExternalReward(
    {
      rewardId,
      source: "rewarded_ad",
      coinAmount,
      recipePieceAmount,
      recipeId,
      policy: {
        fixedAmount: true,
        userInitiated,
        affectsCleanRankedScore: false,
        tiedToScore: false,
        tiedToRank: false,
        tiedToWinLoss: false,
        randomOutcome: false,
        interruptsActivePlay: gameState === "playing"
      }
    },
    storage
  );

  trackEvent("rewarded_ad_complete", {
    placement,
    reward_type: rewardTypeFor(normalizedCoinAmount, normalizedRecipePieceAmount),
    amount: normalizedCoinAmount > 0 ? normalizedCoinAmount : normalizedRecipePieceAmount,
    status: result.ok ? "success" : result.reason === "DUPLICATE_REWARD_ID" ? "duplicate" : "blocked",
    error_code: result.ok ? null : result.reason
  });

  return result;
};
