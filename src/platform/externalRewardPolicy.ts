export type ExternalRewardSource = "share_reward" | "rewarded_ad" | "promotion_point";

export type ExternalRewardPolicyCheck = {
  source: ExternalRewardSource;
  fixedAmount: boolean;
  userInitiated: boolean;
  affectsCleanRankedScore: boolean;
  tiedToScore: boolean;
  tiedToRank: boolean;
  tiedToWinLoss: boolean;
  randomOutcome: boolean;
  interruptsActivePlay: boolean;
};

export type ExternalRewardPolicyDecision = {
  allowed: boolean;
  reason?: string;
};

export const evaluateExternalRewardPolicy = ({
  affectsCleanRankedScore,
  fixedAmount,
  interruptsActivePlay,
  randomOutcome,
  source,
  tiedToRank,
  tiedToScore,
  tiedToWinLoss,
  userInitiated
}: ExternalRewardPolicyCheck): ExternalRewardPolicyDecision => {
  if (affectsCleanRankedScore) {
    return { allowed: false, reason: "AFFECTS_CLEAN_RANKED_SCORE" };
  }

  if (tiedToScore) {
    return { allowed: false, reason: "TIED_TO_SCORE" };
  }

  if (tiedToRank) {
    return { allowed: false, reason: "TIED_TO_RANK" };
  }

  if (tiedToWinLoss) {
    return { allowed: false, reason: "TIED_TO_WIN_LOSS" };
  }

  if (randomOutcome) {
    return { allowed: false, reason: "RANDOM_OUTCOME" };
  }

  if (!fixedAmount) {
    return { allowed: false, reason: "NON_FIXED_AMOUNT" };
  }

  if (!userInitiated) {
    return { allowed: false, reason: "NOT_USER_INITIATED" };
  }

  if (source === "rewarded_ad" && interruptsActivePlay) {
    return { allowed: false, reason: "AD_INTERRUPTS_ACTIVE_PLAY" };
  }

  return { allowed: true };
};
