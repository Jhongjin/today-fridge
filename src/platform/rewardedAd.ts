import { trackEvent } from "./analytics";
import { grantExternalReward, type ExternalRewardGrantResult } from "./externalRewardGrant";
import type { RewardWallet } from "./rewards";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type RewardedAdPlacement = "result_failure" | "result_completion" | "recipe_book";
export type RewardedAdGameState = "playing" | "complete" | "failed" | "menu";
export type RewardedAdClientResult = {
  ok: boolean;
  errorCode?: string;
};

export type RewardedAdShowResult = {
  completed: boolean;
  errorCode?: string;
};

export type RewardedAdClient = {
  load: (placement: RewardedAdPlacement) => Promise<RewardedAdClientResult>;
  show: (placement: RewardedAdPlacement) => Promise<RewardedAdShowResult>;
};

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

export type RewardedAdOfferRequest = Omit<RewardedAdRewardRequest, "adCompleted" | "userInitiated"> & {
  userInitiated?: boolean;
};

export const REWARDED_AD_FAILURE_COIN_REWARD = 10;

const normalizedAmount = (amount: number | undefined) => (Number.isFinite(amount) && Number(amount) > 0 ? Math.floor(Number(amount)) : 0);

const rewardTypeFor = (coinAmount: number, recipePieceAmount = 0): "fridge_coin" | "recipe_piece" | "mixed" => {
  if (coinAmount > 0 && recipePieceAmount > 0) {
    return "mixed";
  }

  return recipePieceAmount > 0 ? "recipe_piece" : "fridge_coin";
};

export const rewardedAdRewardId = (boardRunKey: string, placement: RewardedAdPlacement) =>
  `${boardRunKey}:rewarded-ad:${placement}`;

export const hasClaimedRewardedAdReward = (
  boardRunKey: string,
  placement: RewardedAdPlacement,
  wallet: RewardWallet
): boolean => wallet.claimedRewardIds.includes(rewardedAdRewardId(boardRunKey, placement));

export const createMockRewardedAdClient = (): RewardedAdClient => ({
  async load() {
    return { ok: true };
  },
  async show() {
    return { completed: true };
  }
});

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

export const claimRewardedAdOffer = async (
  client: RewardedAdClient,
  {
    coinAmount,
    gameState,
    placement,
    recipeId,
    recipePieceAmount = 0,
    rewardId,
    userInitiated = true
  }: RewardedAdOfferRequest,
  storage?: RewardStorage
): Promise<ExternalRewardGrantResult> => {
  const normalizedCoinAmount = normalizedAmount(coinAmount);
  const normalizedRecipePieceAmount = normalizedAmount(recipePieceAmount);

  trackEvent("rewarded_ad_offer", {
    placement,
    reward_type: rewardTypeFor(normalizedCoinAmount, normalizedRecipePieceAmount),
    amount: normalizedCoinAmount > 0 ? normalizedCoinAmount : normalizedRecipePieceAmount
  });

  const loadResult = await client.load(placement);

  if (!loadResult.ok) {
    trackEvent("rewarded_ad_complete", {
      placement,
      reward_type: rewardTypeFor(normalizedCoinAmount, normalizedRecipePieceAmount),
      amount: normalizedCoinAmount > 0 ? normalizedCoinAmount : normalizedRecipePieceAmount,
      status: "blocked",
      error_code: loadResult.errorCode ?? "AD_LOAD_FAILED"
    });

    return {
      ok: false,
      reason: loadResult.errorCode ?? "AD_LOAD_FAILED"
    };
  }

  const showResult = await client.show(placement);

  return claimRewardedAdReward(
    {
      rewardId,
      placement,
      gameState,
      userInitiated,
      adCompleted: showResult.completed,
      coinAmount,
      recipePieceAmount,
      recipeId
    },
    storage
  );
};
