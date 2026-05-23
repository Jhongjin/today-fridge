import { describe, expect, it } from "vitest";
import { evaluateExternalRewardPolicy, type ExternalRewardPolicyCheck } from "./externalRewardPolicy";

const safeCheck = (patch: Partial<ExternalRewardPolicyCheck> = {}): ExternalRewardPolicyCheck => ({
  source: "share_reward",
  fixedAmount: true,
  userInitiated: true,
  affectsCleanRankedScore: false,
  tiedToScore: false,
  tiedToRank: false,
  tiedToWinLoss: false,
  randomOutcome: false,
  interruptsActivePlay: false,
  ...patch
});

describe("external reward policy", () => {
  it("allows fixed user-initiated rewards that do not affect ranked score", () => {
    expect(evaluateExternalRewardPolicy(safeCheck())).toEqual({ allowed: true });
  });

  it.each([
    ["AFFECTS_CLEAN_RANKED_SCORE", { affectsCleanRankedScore: true }],
    ["TIED_TO_SCORE", { tiedToScore: true }],
    ["TIED_TO_RANK", { tiedToRank: true }],
    ["TIED_TO_WIN_LOSS", { tiedToWinLoss: true }],
    ["RANDOM_OUTCOME", { randomOutcome: true }],
    ["NON_FIXED_AMOUNT", { fixedAmount: false }],
    ["NOT_USER_INITIATED", { userInitiated: false }]
  ])("blocks external rewards with reason %s", (reason, patch) => {
    expect(evaluateExternalRewardPolicy(safeCheck(patch))).toEqual({
      allowed: false,
      reason
    });
  });

  it("blocks rewarded ads that interrupt active play", () => {
    expect(
      evaluateExternalRewardPolicy(
        safeCheck({
          source: "rewarded_ad",
          interruptsActivePlay: true
        })
      )
    ).toEqual({
      allowed: false,
      reason: "AD_INTERRUPTS_ACTIVE_PLAY"
    });
  });
});
