import { trackEvent } from "./analytics";
import { grantExternalReward, type ExternalRewardGrantResult } from "./externalRewardGrant";
import type { RewardWallet } from "./rewards";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type PromotionAction = "first_launch" | "tutorial_complete" | "attendance" | "event_participation";
export const PROMOTION_ATTENDANCE_COIN_REWARD = 20;

export type PromotionRewardRequest = {
  rewardId: string;
  promotionCode: string;
  action: PromotionAction;
  userInitiated: boolean;
  coinAmount: number;
  recipePieceAmount?: number;
  recipeId?: string;
  tiedToScore?: boolean;
  tiedToRank?: boolean;
  tiedToWinLoss?: boolean;
  randomOutcome?: boolean;
};

export type FixedPromotionActionRewardRequest = {
  promotionCode: string;
  action: PromotionAction;
  userInitiated?: boolean;
  coinAmount?: number;
  recipePieceAmount?: number;
  recipeId?: string;
};

const normalizedAmount = (amount: number | undefined) => (Number.isFinite(amount) && Number(amount) > 0 ? Math.floor(Number(amount)) : 0);

export const promotionRewardId = (promotionCode: string, action: PromotionAction) =>
  `promotion:${promotionCode}:${action}`;

export const hasClaimedPromotionReward = (
  promotionCode: string,
  action: PromotionAction,
  wallet: RewardWallet
): boolean => wallet.claimedRewardIds.includes(promotionRewardId(promotionCode, action));

export const claimPromotionReward = (
  {
    action,
    coinAmount,
    promotionCode,
    randomOutcome = false,
    recipeId,
    recipePieceAmount = 0,
    rewardId,
    tiedToRank = false,
    tiedToScore = false,
    tiedToWinLoss = false,
    userInitiated
  }: PromotionRewardRequest,
  storage?: RewardStorage
): ExternalRewardGrantResult => {
  const result = grantExternalReward(
    {
      rewardId,
      source: "promotion_point",
      coinAmount,
      recipePieceAmount,
      recipeId,
      policy: {
        fixedAmount: true,
        userInitiated,
        affectsCleanRankedScore: false,
        tiedToScore,
        tiedToRank,
        tiedToWinLoss,
        randomOutcome,
        interruptsActivePlay: false
      }
    },
    storage
  );

  trackEvent("promotion_reward", {
    promotion_code: promotionCode,
    action,
    reward_id: rewardId,
    amount: normalizedAmount(coinAmount) > 0 ? normalizedAmount(coinAmount) : normalizedAmount(recipePieceAmount),
    status: result.ok ? "success" : result.reason === "DUPLICATE_REWARD_ID" ? "duplicate" : "blocked",
    error_code: result.ok ? null : result.reason
  });

  return result;
};

export const claimFixedPromotionActionReward = (
  {
    action,
    coinAmount = PROMOTION_ATTENDANCE_COIN_REWARD,
    promotionCode,
    recipeId,
    recipePieceAmount = 0,
    userInitiated = true
  }: FixedPromotionActionRewardRequest,
  storage?: RewardStorage
): ExternalRewardGrantResult =>
  claimPromotionReward(
    {
      rewardId: promotionRewardId(promotionCode, action),
      promotionCode,
      action,
      userInitiated,
      coinAmount,
      recipePieceAmount,
      recipeId,
      tiedToScore: false,
      tiedToRank: false,
      tiedToWinLoss: false,
      randomOutcome: false
    },
    storage
  );
