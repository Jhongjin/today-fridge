import type { TossClient } from "./tossClient";
import { trackEvent } from "./analytics";
import { getScoreSubmissionEligibility, type RunFairnessFlags } from "./fairness";

export type LeaderboardSubmission = {
  playId: string;
  score: number;
  flags: RunFairnessFlags;
};

export type LeaderboardSubmissionResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  errorCode?: string;
};

export type LeaderboardOpenResult = {
  ok: boolean;
  errorCode?: string;
};

export const createLeaderboardService = (client: TossClient) => {
  const submittedPlayIds = new Set<string>();

  const submit = async ({ playId, score, flags }: LeaderboardSubmission): Promise<LeaderboardSubmissionResult> => {
    const eligibility = getScoreSubmissionEligibility(flags);

    if (!eligibility.submittable) {
      trackEvent("leaderboard_submit", {
        play_id: playId,
        score,
        status: "skipped",
        error_code: eligibility.reason ?? null,
        ranked_mode: flags.rankedMode
      });

      return {
        ok: false,
        skipped: true,
        reason: eligibility.reason
      };
    }

    if (submittedPlayIds.has(playId)) {
      trackEvent("leaderboard_submit", {
        play_id: playId,
        score,
        status: "duplicate",
        error_code: "DUPLICATE_PLAY_ID",
        ranked_mode: flags.rankedMode
      });

      return {
        ok: false,
        skipped: true,
        reason: "DUPLICATE_PLAY_ID"
      };
    }

    submittedPlayIds.add(playId);
    const result = await client.submitLeaderboardScore(score, playId);

    trackEvent("leaderboard_submit", {
      play_id: playId,
      score,
      status: result.ok ? "success" : "error",
      error_code: result.errorCode ?? null,
      ranked_mode: flags.rankedMode
    });

    return result.ok ? { ok: true } : { ok: false, errorCode: result.errorCode };
  };

  const open = async (source: string): Promise<LeaderboardOpenResult> => {
    try {
      await client.openLeaderboard();
      trackEvent("leaderboard_open", {
        source,
        status: "success"
      });

      return { ok: true };
    } catch {
      trackEvent("leaderboard_open", {
        source,
        status: "error",
        error_code: "LEADERBOARD_OPEN_FAILED"
      });

      return { ok: false, errorCode: "LEADERBOARD_OPEN_FAILED" };
    }
  };

  return {
    submit,
    open
  };
};
