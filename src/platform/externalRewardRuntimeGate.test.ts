import { describe, expect, it } from "vitest";
import { getExternalRewardRuntimeGate, type ExternalRewardRuntimeEnv } from "./externalRewardRuntimeGate";

const completeEnv = (patch: Partial<ExternalRewardRuntimeEnv> = {}): ExternalRewardRuntimeEnv => ({
  VITE_TOSS_REAL_CLIENT: "true",
  VITE_TOSS_REAL_EXTERNAL_REWARDS: "true",
  VITE_TOSS_CONTACTS_VIRAL_MODULE_ID: "contacts-module",
  VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID: "ad-failure",
  VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID: "ad-completion",
  VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID: "ad-recipe",
  VITE_TOSS_PROMOTION_CODE: "ATTENDANCE_WEEK_1",
  ...patch
});

describe("external reward runtime gate", () => {
  it("keeps normal browser and CI builds on mock external rewards", () => {
    expect(getExternalRewardRuntimeGate(completeEnv({ VITE_TOSS_REAL_EXTERNAL_REWARDS: "false" }))).toMatchObject({
      mode: "mock",
      canUseRealExternalRewards: false,
      blockedReason: null
    });
  });

  it("blocks real external rewards unless the real Toss client is also enabled", () => {
    expect(getExternalRewardRuntimeGate(completeEnv({ VITE_TOSS_REAL_CLIENT: "false" }))).toMatchObject({
      mode: "blocked",
      canUseRealExternalRewards: false,
      blockedReason: "REAL_TOSS_CLIENT_REQUIRED"
    });
  });

  it("blocks real external rewards when console ids are missing", () => {
    const gate = getExternalRewardRuntimeGate(
      completeEnv({
        VITE_TOSS_CONTACTS_VIRAL_MODULE_ID: " ",
        VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID: undefined
      })
    );

    expect(gate).toMatchObject({
      mode: "blocked",
      canUseRealExternalRewards: false,
      blockedReason: "EXTERNAL_REWARD_ENV_MISSING"
    });
    expect(gate.missingKeys).toEqual([
      "VITE_TOSS_CONTACTS_VIRAL_MODULE_ID",
      "VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID"
    ]);
  });

  it("allows real external rewards only when all gate inputs are present", () => {
    expect(getExternalRewardRuntimeGate(completeEnv())).toMatchObject({
      mode: "real",
      canUseRealExternalRewards: true,
      blockedReason: null,
      contactsViralModuleId: "contacts-module",
      rewardedAdGroupIds: {
        result_failure: "ad-failure",
        result_completion: "ad-completion",
        recipe_book: "ad-recipe"
      },
      promotionCode: "ATTENDANCE_WEEK_1"
    });
  });
});
