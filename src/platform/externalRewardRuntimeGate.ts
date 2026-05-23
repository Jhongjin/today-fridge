import type { RewardedAdPlacement } from "./rewardedAd";

export type ExternalRewardRuntimeMode = "mock" | "real" | "blocked";

export type ExternalRewardRuntimeEnv = Pick<
  ImportMetaEnv,
  | "VITE_TOSS_REAL_CLIENT"
  | "VITE_TOSS_REAL_EXTERNAL_REWARDS"
  | "VITE_TOSS_CONTACTS_VIRAL_MODULE_ID"
  | "VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID"
  | "VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID"
  | "VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID"
  | "VITE_TOSS_PROMOTION_CODE"
>;

export type ExternalRewardRuntimeGate = {
  mode: ExternalRewardRuntimeMode;
  canUseRealExternalRewards: boolean;
  realClientEnabled: boolean;
  realExternalRewardsRequested: boolean;
  missingKeys: string[];
  blockedReason: string | null;
  contactsViralModuleId: string | null;
  rewardedAdGroupIds: Record<RewardedAdPlacement, string | null>;
  promotionCode: string | null;
};

const trimEnv = (value: string | undefined): string | null => {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
};

export const getExternalRewardRuntimeGate = (env: ExternalRewardRuntimeEnv = import.meta.env): ExternalRewardRuntimeGate => {
  const realClientEnabled = env.VITE_TOSS_REAL_CLIENT === "true";
  const realExternalRewardsRequested = env.VITE_TOSS_REAL_EXTERNAL_REWARDS === "true";
  const contactsViralModuleId = trimEnv(env.VITE_TOSS_CONTACTS_VIRAL_MODULE_ID);
  const rewardedAdGroupIds: Record<RewardedAdPlacement, string | null> = {
    result_failure: trimEnv(env.VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID),
    result_completion: trimEnv(env.VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID),
    recipe_book: trimEnv(env.VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID)
  };
  const promotionCode = trimEnv(env.VITE_TOSS_PROMOTION_CODE);
  const requiredValues: Array<[string, string | null]> = [
    ["VITE_TOSS_CONTACTS_VIRAL_MODULE_ID", contactsViralModuleId],
    ["VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID", rewardedAdGroupIds.result_failure],
    ["VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID", rewardedAdGroupIds.result_completion],
    ["VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID", rewardedAdGroupIds.recipe_book],
    ["VITE_TOSS_PROMOTION_CODE", promotionCode]
  ];
  const missingKeys = requiredValues.flatMap(([key, value]) => (value ? [] : [key]));

  if (!realExternalRewardsRequested) {
    return {
      mode: "mock",
      canUseRealExternalRewards: false,
      realClientEnabled,
      realExternalRewardsRequested,
      missingKeys,
      blockedReason: null,
      contactsViralModuleId,
      rewardedAdGroupIds,
      promotionCode
    };
  }

  if (!realClientEnabled) {
    return {
      mode: "blocked",
      canUseRealExternalRewards: false,
      realClientEnabled,
      realExternalRewardsRequested,
      missingKeys,
      blockedReason: "REAL_TOSS_CLIENT_REQUIRED",
      contactsViralModuleId,
      rewardedAdGroupIds,
      promotionCode
    };
  }

  if (missingKeys.length > 0) {
    return {
      mode: "blocked",
      canUseRealExternalRewards: false,
      realClientEnabled,
      realExternalRewardsRequested,
      missingKeys,
      blockedReason: "EXTERNAL_REWARD_ENV_MISSING",
      contactsViralModuleId,
      rewardedAdGroupIds,
      promotionCode
    };
  }

  return {
    mode: "real",
    canUseRealExternalRewards: true,
    realClientEnabled,
    realExternalRewardsRequested,
    missingKeys,
    blockedReason: null,
    contactsViralModuleId,
    rewardedAdGroupIds,
    promotionCode
  };
};
