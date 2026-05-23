import { trackEvent } from "./analytics";
import {
  evaluateExternalRewardPolicy,
  type ExternalRewardPolicyCheck,
  type ExternalRewardSource
} from "./externalRewardPolicy";
import { claimFixedReward, readRewardWallet, type RewardClaimResult } from "./rewards";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type ExternalRewardGrantRequest = {
  rewardId: string;
  source: ExternalRewardSource;
  policy: Omit<ExternalRewardPolicyCheck, "source">;
  coinAmount: number;
  recipePieceAmount?: number;
  recipeId?: string;
};

export type ExternalRewardGrantResult =
  | {
      ok: true;
      result: RewardClaimResult;
    }
  | {
      ok: false;
      reason: string;
      result?: RewardClaimResult;
    };

export const grantExternalReward = (
  { coinAmount, policy, recipeId, recipePieceAmount, rewardId, source }: ExternalRewardGrantRequest,
  storage?: RewardStorage
): ExternalRewardGrantResult => {
  const decision = evaluateExternalRewardPolicy({
    ...policy,
    source
  });

  trackEvent("external_reward_policy_check", {
    reward_id: rewardId,
    source,
    allowed: decision.allowed,
    reason: decision.reason ?? null
  });

  if (!decision.allowed) {
    return {
      ok: false,
      reason: decision.reason ?? "EXTERNAL_REWARD_POLICY_BLOCKED"
    };
  }

  const result = claimFixedReward(
    {
      rewardId,
      coinAmount,
      recipePieceAmount,
      recipeId
    },
    storage
  );

  trackEvent("external_reward_claim", {
    reward_id: rewardId,
    source,
    status: result.claimed ? "success" : "duplicate",
    amount: result.coinAmount,
    recipe_piece_amount: result.recipePieceAmount
  });

  if (!result.claimed) {
    return {
      ok: false,
      reason: "DUPLICATE_REWARD_ID",
      result
    };
  }

  return {
    ok: true,
    result
  };
};

export const readExternalRewardWallet = (storage?: RewardStorage) => readRewardWallet(storage);
