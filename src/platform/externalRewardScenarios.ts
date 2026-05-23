import { readExternalRewardWallet } from "./externalRewardGrant";
import { claimPromotionReward } from "./promotionReward";
import { claimRewardedAdReward } from "./rewardedAd";
import { claimShareReward } from "./shareReward";
import type { RewardWallet } from "./rewards";
import type { ExternalRewardGrantResult } from "./externalRewardGrant";

type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type ExternalRewardScenarioName =
  | "share_send_viral_fixed"
  | "rewarded_ad_complete_fixed"
  | "rewarded_ad_active_play_blocked"
  | "promotion_first_launch_fixed"
  | "promotion_score_blocked"
  | "promotion_rank_blocked"
  | "promotion_win_loss_blocked"
  | "promotion_random_blocked"
  | "promotion_auto_blocked";

export type ExternalRewardScenarioResult = {
  name: ExternalRewardScenarioName;
  rewardId: string;
  ok: boolean;
  reason: string | null;
  cleanRankedScoreDelta: 0;
};

export type ExternalRewardScenarioReport = {
  results: ExternalRewardScenarioResult[];
  wallet: RewardWallet;
  allowedRewardIds: string[];
  blockedReasons: string[];
  cleanRankedScoreDelta: 0;
  safeForCleanRankedScore: boolean;
};

const captureScenario = (
  name: ExternalRewardScenarioName,
  rewardId: string,
  result: ExternalRewardGrantResult
): ExternalRewardScenarioResult => ({
  name,
  rewardId,
  ok: result.ok,
  reason: result.ok ? null : result.reason,
  cleanRankedScoreDelta: 0
});

export const runExternalRewardQaScenarios = (storage?: RewardStorage): ExternalRewardScenarioReport => {
  const results: ExternalRewardScenarioResult[] = [
    captureScenario(
      "share_send_viral_fixed",
      "qa:share:send-viral",
      claimShareReward(
        {
          rewardId: "qa:share:send-viral",
          playId: "qa-play",
          boardId: "qa-board",
          coinAmount: 10
        },
        storage
      )
    ),
    captureScenario(
      "rewarded_ad_complete_fixed",
      "qa:ad:complete",
      claimRewardedAdReward(
        {
          rewardId: "qa:ad:complete",
          placement: "result_failure",
          gameState: "failed",
          userInitiated: true,
          adCompleted: true,
          coinAmount: 15
        },
        storage
      )
    ),
    captureScenario(
      "rewarded_ad_active_play_blocked",
      "qa:ad:active-play",
      claimRewardedAdReward(
        {
          rewardId: "qa:ad:active-play",
          placement: "result_completion",
          gameState: "playing",
          userInitiated: true,
          adCompleted: true,
          coinAmount: 15
        },
        storage
      )
    ),
    captureScenario(
      "promotion_first_launch_fixed",
      "qa:promotion:first-launch",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:first-launch",
          promotionCode: "QA_FIRST_LAUNCH",
          action: "first_launch",
          userInitiated: true,
          coinAmount: 20
        },
        storage
      )
    ),
    captureScenario(
      "promotion_score_blocked",
      "qa:promotion:score",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:score",
          promotionCode: "QA_SCORE",
          action: "event_participation",
          userInitiated: true,
          coinAmount: 20,
          tiedToScore: true
        },
        storage
      )
    ),
    captureScenario(
      "promotion_rank_blocked",
      "qa:promotion:rank",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:rank",
          promotionCode: "QA_RANK",
          action: "event_participation",
          userInitiated: true,
          coinAmount: 20,
          tiedToRank: true
        },
        storage
      )
    ),
    captureScenario(
      "promotion_win_loss_blocked",
      "qa:promotion:win-loss",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:win-loss",
          promotionCode: "QA_WIN_LOSS",
          action: "event_participation",
          userInitiated: true,
          coinAmount: 20,
          tiedToWinLoss: true
        },
        storage
      )
    ),
    captureScenario(
      "promotion_random_blocked",
      "qa:promotion:random",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:random",
          promotionCode: "QA_RANDOM",
          action: "event_participation",
          userInitiated: true,
          coinAmount: 20,
          randomOutcome: true
        },
        storage
      )
    ),
    captureScenario(
      "promotion_auto_blocked",
      "qa:promotion:auto",
      claimPromotionReward(
        {
          rewardId: "qa:promotion:auto",
          promotionCode: "QA_AUTO",
          action: "attendance",
          userInitiated: false,
          coinAmount: 20
        },
        storage
      )
    )
  ];

  const allowedRewardIds = results.filter((result) => result.ok).map((result) => result.rewardId);
  const blockedReasons = results.flatMap((result) => (result.reason ? [result.reason] : []));
  const wallet = readExternalRewardWallet(storage);
  const safeForCleanRankedScore =
    results.every((result) => result.cleanRankedScoreDelta === 0) &&
    wallet.claimedRewardIds.every((rewardId) => allowedRewardIds.includes(rewardId));

  return {
    results,
    wallet,
    allowedRewardIds,
    blockedReasons,
    cleanRankedScoreDelta: 0,
    safeForCleanRankedScore
  };
};
