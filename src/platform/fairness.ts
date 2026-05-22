export type RunFairnessFlags = {
  rankedMode: boolean;
  boosterUsed: boolean;
  adRecoveryUsed: boolean;
  shareBonusUsed: boolean;
};

export type ScoreSubmissionEligibility = {
  submittable: boolean;
  reason?: "NOT_RANKED" | "BOOSTER_USED" | "AD_RECOVERY_USED" | "SHARE_BONUS_USED";
};

export const cleanRankedFlags = (): RunFairnessFlags => ({
  rankedMode: true,
  boosterUsed: false,
  adRecoveryUsed: false,
  shareBonusUsed: false
});

export const getScoreSubmissionEligibility = (flags: RunFairnessFlags): ScoreSubmissionEligibility => {
  if (!flags.rankedMode) {
    return { submittable: false, reason: "NOT_RANKED" };
  }

  if (flags.boosterUsed) {
    return { submittable: false, reason: "BOOSTER_USED" };
  }

  if (flags.adRecoveryUsed) {
    return { submittable: false, reason: "AD_RECOVERY_USED" };
  }

  if (flags.shareBonusUsed) {
    return { submittable: false, reason: "SHARE_BONUS_USED" };
  }

  return { submittable: true };
};

