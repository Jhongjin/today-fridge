import type { TossClient } from "./tossClient";
import { trackEvent, type AnalyticsProperties } from "./analytics";
import { getScoreSubmissionEligibility, type RunFairnessFlags } from "./fairness";

export type LeaderboardSubmission = {
  playId: string;
  score: number;
  flags: RunFairnessFlags;
  audit?: LeaderboardScoreAudit;
};

export type LeaderboardScoreAudit = {
  boardId: string;
  seed: string;
  routeCells: string;
  routeIngredients: string;
  routeLength: number;
  movesUsed: number;
  rescuedCount: number;
  completedRecipes: string;
  scoreBreakdownReceipt: string;
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

  const auditProperties = (audit?: LeaderboardScoreAudit): AnalyticsProperties =>
    audit
      ? {
          board_id: audit.boardId,
          seed: audit.seed,
          route_cells: audit.routeCells,
          route_ingredients: audit.routeIngredients,
          route_length: audit.routeLength,
          moves_used: audit.movesUsed,
          rescued_count: audit.rescuedCount,
          completed_recipes: audit.completedRecipes,
          score_breakdown_receipt: audit.scoreBreakdownReceipt
        }
      : {};

  const submit = async ({ playId, score, flags, audit }: LeaderboardSubmission): Promise<LeaderboardSubmissionResult> => {
    const eligibility = getScoreSubmissionEligibility(flags);

    if (!eligibility.submittable) {
      trackEvent("leaderboard_submit", {
        play_id: playId,
        score,
        status: "skipped",
        error_code: eligibility.reason ?? null,
        ranked_mode: flags.rankedMode,
        ...auditProperties(audit)
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
        ranked_mode: flags.rankedMode,
        ...auditProperties(audit)
      });

      return {
        ok: false,
        skipped: true,
        reason: "DUPLICATE_PLAY_ID"
      };
    }

    const result = await client.submitLeaderboardScore(score, playId);

    if (result.ok) {
      submittedPlayIds.add(playId);
    }

    trackEvent("leaderboard_submit", {
      play_id: playId,
      score,
      status: result.ok ? "success" : "error",
      error_code: result.errorCode ?? null,
      ranked_mode: flags.rankedMode,
      ...auditProperties(audit)
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
