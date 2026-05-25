import { BookOpen, Pause, Play, Share2, Trophy, Volume2, VolumeX, Waves, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createAudioController } from "../audio/audioController";
import { createWebAudioOutput } from "../audio/webAudioOutput";
import { firstDailyBoard } from "../game/data/boards";
import { getIngredient } from "../game/data/ingredients";
import { getRecipe } from "../game/data/recipes";
import { applyKstDailySeed, getMsUntilNextKstRefresh, getNextKstRefreshAt } from "../game/engine/dailySeed";
import { createInitialState, selectIngredient } from "../game/engine/gameEngine";
import { activeRoundDurationMs, pausedDurationMs } from "../game/engine/roundClock";
import { SCORE, totalScore } from "../game/engine/scoring";
import { scoreTierFor } from "../game/engine/scoreTier";
import type { BoardCell, IngredientInstance, ScoreBreakdown } from "../game/types";
import { createHapticsController } from "../haptics/hapticsController";
import { configureAnalyticsContext, getAnalyticsContext, trackEvent, type UserKeyStatus } from "../platform/analytics";
import { recordDailyStreak } from "../platform/dailyStreak";
import { cleanRankedFlags, getScoreSubmissionEligibility } from "../platform/fairness";
import { createLeaderboardService, GAME_USER_KEY_UNAVAILABLE } from "../platform/leaderboard";
import {
  readMutedPreference,
  readReduceMotionPreference,
  writeMutedPreference,
  writeReduceMotionPreference
} from "../platform/preferences";
import {
  readPersonalBest,
  readPersonalBestRoute,
  recordPersonalBest,
  recordPersonalBestRoute,
  type PersonalBestRouteStep
} from "../platform/personalBest";
import {
  claimCompletionReward,
  claimParticipationReward,
  hasClaimedCompletionReward,
  hasClaimedParticipationReward,
  readRewardWallet
} from "../platform/rewards";
import { createRuntimeTossClient } from "../platform/runtimeTossClient";
import { createMockShareClient, createResultShareService } from "../platform/share";
import {
  FRIEND_CHALLENGE_COIN_REWARD,
  claimShareReward,
  hasClaimedShareReward,
  shareRewardId
} from "../platform/shareReward";
import { AnalyticsQaPanel } from "./AnalyticsQaPanel";
import { RecipeBookPanel } from "./RecipeBookPanel";

const board = applyKstDailySeed(firstDailyBoard);
const dailyRunKey = `${board.id}:${board.seed}`;
const dailyDateKey = board.seed.slice(0, 10);

const createPlayId = () => `${board.seed}-${Date.now()}`;

const getLoadMs = () => (typeof performance !== "undefined" ? Math.round(performance.now()) : 0);

const getResultShareUrl = () => {
  if (typeof location === "undefined") {
    return undefined;
  }

  return `${location.origin}${location.pathname}`;
};

const getDailyRefreshInfo = () => {
  const now = new Date();
  const nextRefreshAt = getNextKstRefreshAt(now);
  const totalMinutes = Math.max(1, Math.ceil(getMsUntilNextKstRefresh(now) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const remainingLabel = hours > 0 ? `${hours}시간 ${minutes}분 후` : `${minutes}분 후`;
  const refreshTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(nextRefreshAt);

  return {
    remainingLabel,
    refreshTimeLabel
  };
};

const trayStateHash = (tray: IngredientInstance[]) =>
  tray.map((instance) => `${instance.ingredientId}:${instance.state}`).join("|") || "empty";

const scoreBreakdownReceipt = (breakdown: ScoreBreakdown) =>
  Object.entries(breakdown)
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

const trackRoundStart = (playId: string, attemptNo: number) => {
  trackEvent("round_start", {
    play_id: playId,
    board_id: board.id,
    seed: board.seed,
    attempt_no: attemptNo,
    ranked_mode: true
  });
};

const trackMissionSummary = ({
  playId,
  recipeCompleted,
  rescueCompleted,
  cleanRecordCompleted
}: {
  playId: string;
  recipeCompleted: boolean;
  rescueCompleted: boolean;
  cleanRecordCompleted: boolean;
}) => {
  const completedCount = [recipeCompleted, rescueCompleted, cleanRecordCompleted].filter(Boolean).length;

  trackEvent("mission_summary", {
    play_id: playId,
    completed_count: completedCount,
    total_count: 3,
    recipe_completed: recipeCompleted,
    rescue_completed: rescueCompleted,
    clean_record_completed: cleanRecordCompleted
  });
};

type TutorialStep = "match" | "recipe" | "done";
type ProfileGateStatus = "checking" | "ready" | "blocked" | "error";

const tutorialCopy: Record<Exclude<TutorialStep, "done">, string> = {
  match: "두부 3개 먼저 정리",
  recipe: "밥 + 김치 + 계란 완성"
};

const profileGateCopy: Record<ProfileGateStatus, { title: string; message: string }> = {
  checking: {
    title: "프로필 확인 중",
    message: "게임 프로필 확인 중이에요."
  },
  ready: {
    title: "토스 게임 프로필 확인 완료",
    message: "랭킹 도전 준비됐어요."
  },
  blocked: {
    title: "프로필 확인 필요",
    message: "프로필 생성 후 도전 가능해요."
  },
  error: {
    title: "프로필 확인 실패",
    message: "잠시 후 다시 열어 주세요."
  }
};

const tutorialHighlightCells: Record<Exclude<TutorialStep, "done">, string[]> = {
  match: ["E1", "B3", "C6"],
  recipe: ["E5", "A6", "B6"]
};

const cleanRouteCellIds = ["E1", "B3", "C6", "E5", "A6", "B6"];
const recipePieceTarget = 3;

const isAnalyticsQaEnabled = () => {
  if (typeof location === "undefined") {
    return false;
  }

  const params = new URLSearchParams(location.search);
  return params.get("qa") === "analytics" || params.has("analytics_debug");
};

const userKeyStatusFor = (userKey: string | undefined): UserKeyStatus => {
  if (!userKey) {
    return "unavailable";
  }

  return userKey === "mock-user-key" ? "mock" : "ready";
};

const findNextHintCellId = (cells: BoardCell[]): string | null => {
  const routeCellId = cleanRouteCellIds.find((cellId) => cells.some((cell) => cell.id === cellId && cell.front));

  if (routeCellId) {
    return routeCellId;
  }

  return cells.find((cell) => !cell.blocked && cell.front)?.id ?? null;
};

const IngredientTile = ({
  instance,
  hiddenBack,
  blocked,
  highlighted,
  disabled,
  onClick
}: {
  instance?: IngredientInstance;
  hiddenBack?: boolean;
  blocked?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  if (blocked) {
    return (
      <div className="tile tile--blocked" aria-label="큰 반찬통">
        <span>통</span>
      </div>
    );
  }

  if (!instance) {
    return <div className="tile tile--empty" aria-label="빈 칸" />;
  }

  const ingredient = getIngredient(instance.ingredientId);

  return (
    <button
      className={`tile tile--${instance.state}${highlighted ? " tile--highlighted" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={`cell-${instance.instanceId}`}
      aria-label={`${ingredient.name}${instance.state === "expiring" ? " 임박" : ""}`}
    >
      {hiddenBack ? <span className="tile__stack" aria-hidden="true" /> : null}
      <span className="tile__icon" aria-hidden="true">
        {ingredient.icon}
      </span>
      <span className="tile__label">{ingredient.name}</span>
      {instance.state === "expiring" ? <span className="tile__badge">임박</span> : null}
    </button>
  );
};

const TraySlot = ({ instance }: { instance?: IngredientInstance }) => {
  if (!instance) {
    return <div className="tray-slot" aria-label="빈 준비대 칸" />;
  }

  const ingredient = getIngredient(instance.ingredientId);

  return (
    <div className={`tray-slot tray-slot--filled tray-slot--${instance.state}`} aria-label={ingredient.name}>
      <span aria-hidden="true">{ingredient.icon}</span>
      <small>{ingredient.name}</small>
    </div>
  );
};

const scoreRows = (breakdown: ReturnType<typeof createInitialState>["breakdown"]) => [
  ["재료 정리", breakdown.clearPoints],
  ["레시피 완성", breakdown.recipePoints],
  ["임박 재료 구출", breakdown.rescueBonus],
  ["콤보", breakdown.comboBonus],
  ["남은 칸", breakdown.remainingTrayBonus],
  ["음식물 낭비 0", breakdown.zeroWasteBonus],
  ["이동 보너스", breakdown.moveEfficiencyBonus],
  ["남은 임박 재료", -breakdown.wastePenalty]
];

export const App = () => {
  const [gameState, setGameState] = useState(() => createInitialState(board));
  const [playId, setPlayId] = useState(createPlayId);
  const [attemptNo, setAttemptNo] = useState(1);
  const [roundStartedAt, setRoundStartedAt] = useState(() => Date.now());
  const [muted, setMuted] = useState(readMutedPreference);
  const [reduceMotion, setReduceMotion] = useState(readReduceMotionPreference);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedStartedAt, setPausedStartedAt] = useState<number | null>(null);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "skipped" | "error">("idle");
  const [submitReason, setSubmitReason] = useState<string | null>(null);
  const [leaderboardOpenStatus, setLeaderboardOpenStatus] = useState<"idle" | "opening" | "opened" | "error">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "success" | "error">("idle");
  const [friendChallengeStatus, setFriendChallengeStatus] = useState<
    "idle" | "sending" | "rewarded" | "shared" | "error"
  >("idle");
  const [personalBest, setPersonalBest] = useState(() => readPersonalBest(dailyRunKey));
  const [bestRoute, setBestRoute] = useState(() => readPersonalBestRoute(dailyRunKey));
  const [currentRoute, setCurrentRoute] = useState<PersonalBestRouteStep[]>([]);
  const [bestRouteDeviationTracked, setBestRouteDeviationTracked] = useState(false);
  const [lastBestDelta, setLastBestDelta] = useState<number | null>(null);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("match");
  const [runFlags, setRunFlags] = useState(cleanRankedFlags);
  const [boosterHintCellId, setBoosterHintCellId] = useState<string | null>(null);
  const [rewardWallet, setRewardWallet] = useState(readRewardWallet);
  const [rewardStatus, setRewardStatus] = useState<"idle" | "claimed" | "already_claimed">("idle");
  const [dailyRefreshInfo, setDailyRefreshInfo] = useState(getDailyRefreshInfo);
  const [dailyStreak] = useState(() => recordDailyStreak(dailyDateKey));
  const [recipeBookOpen, setRecipeBookOpen] = useState(false);
  const [profileGateStatus, setProfileGateStatus] = useState<ProfileGateStatus>("checking");
  const [roundStartTracked, setRoundStartTracked] = useState(false);
  const recipe = getRecipe(board.mainRecipeId);
  const score = totalScore(gameState.breakdown);
  const bestGap = Math.max(0, personalBest - score);
  const bestChase =
    personalBest === 0
      ? {
          state: "first",
          label: "첫 기록 도전",
          value: "완주하면 저장"
        }
      : score > personalBest
        ? {
            state: "ahead",
            label: "기록 추월",
            value: `+${(score - personalBest).toLocaleString()}점`
          }
        : score === personalBest
          ? {
              state: "tie",
              label: "최고와 동점",
              value: "한 번 더 정리"
            }
          : {
              state: "behind",
              label: "최고까지",
              value: `${bestGap.toLocaleString()}점`
          };
  const bestRouteProgress = bestRoute
    ? (() => {
        let matched = 0;

        for (const [index, step] of currentRoute.entries()) {
          const routeStep = bestRoute.steps[index];

          if (!routeStep || routeStep.cellId !== step.cellId || routeStep.ingredientId !== step.ingredientId) {
            return {
              state: "off",
              matched,
              total: bestRoute.steps.length,
              score: bestRoute.score
            };
          }

          matched += 1;
        }

        return {
          state: matched === 0 ? "ready" : "on",
          matched,
          total: bestRoute.steps.length,
          score: bestRoute.score
        };
      })()
    : null;
  const bestRouteStatusLabel =
    bestRouteProgress === null
      ? ""
      : bestRouteProgress.state === "off"
        ? `새 루트 실험 중 · 최고 ${bestRouteProgress.total}수`
        : bestRouteProgress.matched === 0
          ? `최고 루트 ${bestRouteProgress.score.toLocaleString()}점 · ${bestRouteProgress.total}수`
          : `최고 루트 진행 ${bestRouteProgress.matched}/${bestRouteProgress.total}`;
  const cleanRun = getScoreSubmissionEligibility(runFlags).submittable;
  const profileGateLocked = profileGateStatus !== "ready";
  const profileGate = profileGateCopy[profileGateStatus];
  const recipePieceCount = rewardWallet.recipePieces[recipe.id] ?? 0;
  const recipePieceProgress = Math.min(recipePieceCount, recipePieceTarget);
  const recipePieceProgressPercent = `${Math.round((recipePieceProgress / recipePieceTarget) * 100)}%`;
  const completionRewardClaimed = hasClaimedCompletionReward(dailyRunKey, rewardWallet);
  const participationRewardClaimed = hasClaimedParticipationReward(dailyRunKey, rewardWallet);
  const friendChallengeRewardClaimed = hasClaimedShareReward(dailyRunKey, rewardWallet);
  const friendChallengeLabel =
    friendChallengeStatus === "rewarded"
      ? `친구 도전 보냄 +${FRIEND_CHALLENGE_COIN_REWARD}`
      : friendChallengeStatus === "shared"
        ? "친구 도전 다시 보냄"
        : friendChallengeStatus === "sending"
          ? "친구 도전 보내는 중"
          : friendChallengeStatus === "error"
            ? "친구 도전 실패"
            : friendChallengeRewardClaimed
              ? "친구 도전 다시 보내기"
              : `친구 도전 보내기 +${FRIEND_CHALLENGE_COIN_REWARD}`;
  const missionRows = [
    {
      id: "recipe",
      label: "레시피 완성",
      complete: gameState.completedRecipeIds.includes(recipe.id)
    },
    {
      id: "rescue",
      label: "임박 재료 구조",
      complete: gameState.rescuedCount >= board.rescueTarget
    },
    {
      id: "clean",
      label: "클린 기록",
      complete: gameState.status === "complete" && cleanRun
    }
  ];
  const completedMissionCount = missionRows.filter((row) => row.complete).length;
  const scoreTier = scoreTierFor({
    cleanRun,
    score,
    status: gameState.status
  });
  const highlightedCells = useMemo(() => {
    const cellIds = new Set(tutorialStep === "done" ? [] : tutorialHighlightCells[tutorialStep]);

    if (boosterHintCellId) {
      cellIds.add(boosterHintCellId);
    }

    return cellIds;
  }, [boosterHintCellId, tutorialStep]);
  const tossClient = useMemo(() => createRuntimeTossClient(), []);
  const leaderboardService = useMemo(() => createLeaderboardService(tossClient), [tossClient]);
  const resultShareService = useMemo(() => createResultShareService(createMockShareClient()), []);
  const audioController = useMemo(() => createAudioController(createWebAudioOutput()), []);
  const hapticsController = useMemo(() => createHapticsController(), []);
  const analyticsQaEnabled = useMemo(isAnalyticsQaEnabled, []);

  useEffect(() => {
    const context = getAnalyticsContext();

    trackEvent("app_open", {
      entry_source: context.entrySource,
      toss_app_version: null
    });
    trackEvent("first_playable_ready", {
      load_ms: getLoadMs()
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void tossClient
      .getUserKey()
      .then((userKey) => {
        if (cancelled) {
          return;
        }

        const result = userKeyStatusFor(userKey);
        const status = result === "ready" || result === "mock" ? "ready" : "blocked";

        configureAnalyticsContext({ userKeyStatus: result });
        setProfileGateStatus(status);
        trackEvent("game_user_key_result", {
          result,
          error_code: null
        });
        trackEvent("profile_gate_result", {
          status,
          user_key_status: result
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        configureAnalyticsContext({ userKeyStatus: "error" });
        setProfileGateStatus("error");
        trackEvent("game_user_key_result", {
          result: "error",
          error_code: "GET_USER_KEY_FAILED"
        });
        trackEvent("profile_gate_result", {
          status: "error",
          user_key_status: "error"
        });
      });

    return () => {
      cancelled = true;
    };
  }, [tossClient]);

  useEffect(() => {
    if (profileGateStatus !== "ready" || roundStartTracked) {
      return;
    }

    setRoundStartedAt(Date.now());
    setRoundStartTracked(true);
    trackRoundStart(playId, attemptNo);
  }, [attemptNo, playId, profileGateStatus, roundStartTracked]);

  useEffect(() => {
    audioController.setMuted(muted);
  }, [audioController, muted]);

  useEffect(() => {
    hapticsController.setEnabled(!reduceMotion);
  }, [hapticsController, reduceMotion]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDailyRefreshInfo(getDailyRefreshInfo());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const applyAudioVisibility = (trackVisibilityEvent: boolean) => {
      const hidden = document.visibilityState === "hidden";
      audioController.setSuspended(hidden);

      if (trackVisibilityEvent) {
        trackEvent("audio_visibility_change", {
          play_id: playId,
          hidden
        });
      }
    };

    const handleVisibilityChange = () => applyAudioVisibility(true);
    const suspendAudio = () => {
      audioController.setSuspended(true);
      trackEvent("audio_visibility_change", {
        play_id: playId,
        hidden: true
      });
    };
    const resumeAudio = () => applyAudioVisibility(true);

    applyAudioVisibility(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", suspendAudio);
    window.addEventListener("pageshow", resumeAudio);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", suspendAudio);
      window.removeEventListener("pageshow", resumeAudio);
    };
  }, [audioController, playId]);

  const selectCell = (cell: BoardCell) => {
    if (isPaused || profileGateLocked) {
      return;
    }

    const current = gameState;
    const next = selectIngredient(current, board, cell.id);

    if (next === current) {
      return;
    }

    const selectedIngredientId = cell.front?.ingredientId ?? null;
    const nextRoute =
      selectedIngredientId === null
        ? currentRoute
        : [
            ...currentRoute,
            {
              cellId: cell.id,
              ingredientId: selectedIngredientId
            }
          ];
    const expectedBestRouteStep = bestRoute?.steps[currentRoute.length] ?? null;
    const deviatedFromBestRoute =
      Boolean(bestRoute) &&
      selectedIngredientId !== null &&
      !bestRouteDeviationTracked &&
      (expectedBestRouteStep?.cellId !== cell.id || expectedBestRouteStep?.ingredientId !== selectedIngredientId);

    if (boosterHintCellId === cell.id) {
      setBoosterHintCellId(null);
    }

    if (deviatedFromBestRoute) {
      setBestRouteDeviationTracked(true);
      trackEvent("best_route_deviation", {
        play_id: playId,
        step_no: currentRoute.length + 1,
        matched_steps: currentRoute.length,
        expected_cell_id: expectedBestRouteStep?.cellId ?? null,
        selected_cell_id: cell.id
      });
    }

    trackEvent("move_commit", {
      play_id: playId,
      cell_id: cell.id,
      ingredient_id: selectedIngredientId,
      move_no: next.movesUsed,
      tray_state_hash: trayStateHash(next.tray),
      score: totalScore(next.breakdown)
    });
    audioController.play("ingredient_select");
    hapticsController.play("ingredient_select");

    if (next.lastClear?.type === "match") {
      trackEvent("match_clear", {
        play_id: playId,
        ingredient_id: next.lastClear.ingredientId,
        count: next.lastClear.instances.length,
        combo_index: next.lastClear.comboIndex,
        points: next.lastClear.points
      });
      if (tutorialStep === "match") {
        setTutorialStep("recipe");
      }
      audioController.play("match_clear");
      hapticsController.play("match_clear");
    }

    if (next.lastClear?.type === "recipe") {
      trackEvent("recipe_complete", {
        play_id: playId,
        recipe_id: next.lastClear.recipeId,
        points: next.lastClear.points
      });
      if (tutorialStep === "recipe") {
        setTutorialStep("done");
      }
      audioController.play("recipe_complete");
      hapticsController.play("recipe_complete");
    }

    if (next.rescuedCount > current.rescuedCount) {
      const rescuedInstances = next.lastClear?.instances.filter((instance) => instance.state === "expiring") ?? [];

      for (const instance of rescuedInstances) {
        trackEvent("expiring_rescue", {
          play_id: playId,
          ingredient_id: instance.ingredientId,
          points: SCORE.expiringRescue
        });
      }

      audioController.play("expiring_rescue");
      hapticsController.play("expiring_rescue");
    }

    if (next.status === "complete" && current.status === "playing") {
      const finalScore = totalScore(next.breakdown);
      const completedAt = Date.now();

      if (cleanRun) {
        const bestImproved = finalScore > personalBest;
        const bestDelta = bestImproved ? finalScore - personalBest : 0;
        const nextPersonalBest = Math.max(personalBest, finalScore);

        if (bestImproved) {
          recordPersonalBest(dailyRunKey, finalScore);
          const recordedRoute = recordPersonalBestRoute(dailyRunKey, {
            score: finalScore,
            steps: nextRoute
          });
          setBestRoute(recordedRoute);
        }

        setPersonalBest(nextPersonalBest);
        setLastBestDelta(bestDelta);

        if (bestImproved) {
          trackEvent("personal_best_update", {
            old_score: personalBest,
            new_score: nextPersonalBest,
            delta: bestDelta
          });
        }
      } else {
        setLastBestDelta(null);
      }

      trackEvent("round_complete", {
        play_id: playId,
        score: finalScore,
        score_tier: scoreTierFor({
          cleanRun,
          score: finalScore,
          status: next.status
        }),
        duration_ms: activeRoundDurationMs({
          nowMs: completedAt,
          startedAtMs: roundStartedAt,
          totalPausedMs
        }),
        paused_ms: totalPausedMs,
        moves_used: next.movesUsed,
        recipe_count: next.completedRecipeIds.length,
        rescued_count: next.rescuedCount
      });
      trackMissionSummary({
        playId,
        recipeCompleted: next.completedRecipeIds.includes(board.mainRecipeId),
        rescueCompleted: next.rescuedCount >= board.rescueTarget,
        cleanRecordCompleted: cleanRun
      });
      audioController.play("round_complete");
      hapticsController.play("round_complete");
      setTutorialStep("done");
    }

    if (next.status === "failed" && current.status === "playing") {
      trackEvent("round_fail", {
        play_id: playId,
        fail_reason: next.movesUsed > board.moveLimit ? "MOVE_LIMIT" : "TRAY_OVERFLOW",
        move_no: next.movesUsed,
        tray_state_hash: trayStateHash(next.tray)
      });
      trackMissionSummary({
        playId,
        recipeCompleted: next.completedRecipeIds.includes(board.mainRecipeId),
        rescueCompleted: next.rescuedCount >= board.rescueTarget,
        cleanRecordCompleted: false
      });
      audioController.play("round_fail");
      hapticsController.play("round_fail");
    }

    setCurrentRoute(nextRoute);
    setGameState(next);
  };

  const restart = () => {
    const nextAttemptNo = attemptNo + 1;
    const nextPlayId = createPlayId();

    trackRoundStart(nextPlayId, nextAttemptNo);
    setIsPaused(false);
    setPausedStartedAt(null);
    setTotalPausedMs(0);
    setGameState(createInitialState(board));
    setPlayId(nextPlayId);
    setAttemptNo(nextAttemptNo);
    setRoundStartedAt(Date.now());
    setLastBestDelta(null);
    setCurrentRoute([]);
    setBestRouteDeviationTracked(false);
    setTutorialStep((step) => (step === "done" ? "done" : "match"));
    setRunFlags(cleanRankedFlags());
    setBoosterHintCellId(null);
    setRewardStatus("idle");
    setSubmitStatus("idle");
    setLeaderboardOpenStatus("idle");
    setShareStatus("idle");
    setFriendChallengeStatus("idle");
  };

  const useHintBooster = () => {
    if (gameState.status !== "playing" || isPaused || profileGateLocked) {
      return;
    }

    const hintCellId = findNextHintCellId(gameState.board);

    if (!hintCellId) {
      return;
    }

    setBoosterHintCellId(hintCellId);
    setRunFlags((flags) => ({
      ...flags,
      boosterUsed: true
    }));
    trackEvent("booster_use", {
      play_id: playId,
      booster_id: "recipe_hint",
      ranked_mode: runFlags.rankedMode
    });
    audioController.play("booster_use");
    hapticsController.play("booster_use");
  };

  const pauseGame = () => {
    if (gameState.status !== "playing" || isPaused || profileGateLocked) {
      return;
    }

    const pausedAt = Date.now();

    setIsPaused(true);
    setPausedStartedAt(pausedAt);
    audioController.play("game_pause");
    hapticsController.play("game_pause");
    trackEvent("game_pause", {
      play_id: playId,
      moves_used: gameState.movesUsed,
      score,
      active_duration_ms: activeRoundDurationMs({
        nowMs: pausedAt,
        startedAtMs: roundStartedAt,
        totalPausedMs
      }),
      total_paused_ms: totalPausedMs
    });
  };

  const resumeGame = () => {
    if (!isPaused) {
      return;
    }

    const resumedAt = Date.now();
    const pausedMs = pausedDurationMs(pausedStartedAt, resumedAt);
    const nextTotalPausedMs = totalPausedMs + pausedMs;

    setIsPaused(false);
    setPausedStartedAt(null);
    setTotalPausedMs(nextTotalPausedMs);
    audioController.play("game_resume");
    hapticsController.play("game_resume");
    trackEvent("game_resume", {
      play_id: playId,
      moves_used: gameState.movesUsed,
      score,
      paused_ms: pausedMs,
      total_paused_ms: nextTotalPausedMs,
      active_duration_ms: activeRoundDurationMs({
        nowMs: resumedAt,
        startedAtMs: roundStartedAt,
        totalPausedMs: nextTotalPausedMs
      })
    });
  };

  const toggleMuted = () => {
    const nextMuted = !muted;

    writeMutedPreference(nextMuted);
    setMuted(nextMuted);
    trackEvent("setting_toggle", {
      setting_id: "mute",
      enabled: nextMuted
    });
  };

  const toggleReduceMotion = () => {
    const nextReduceMotion = !reduceMotion;

    writeReduceMotionPreference(nextReduceMotion);
    setReduceMotion(nextReduceMotion);
    trackEvent("setting_toggle", {
      setting_id: "reduce_motion",
      enabled: nextReduceMotion
    });
  };

  const claimReward = () => {
    if (gameState.status !== "complete") {
      return;
    }

    const result = claimCompletionReward(dailyRunKey, recipe.id);

    setRewardWallet(result.wallet);
    setRewardStatus(result.claimed ? "claimed" : "already_claimed");
    trackEvent("daily_reward_claim", {
      reward_id: result.rewardId,
      reward_type: "completion",
      amount: result.coinAmount,
      status: result.claimed ? "success" : "duplicate"
    });

    if (result.claimed) {
      trackEvent("coin_award", {
        source: "daily_completion",
        amount: result.coinAmount
      });
      trackEvent("recipe_piece_award", {
        recipe_id: recipe.id,
        source: "daily_completion",
        amount: result.recipePieceAmount
      });
    }
  };

  const claimFailureReward = () => {
    if (gameState.status !== "failed") {
      return;
    }

    const result = claimParticipationReward(dailyRunKey);

    setRewardWallet(result.wallet);
    setRewardStatus(result.claimed ? "claimed" : "already_claimed");
    trackEvent("daily_reward_claim", {
      reward_id: result.rewardId,
      reward_type: "participation",
      amount: result.coinAmount,
      status: result.claimed ? "success" : "duplicate"
    });

    if (result.claimed) {
      trackEvent("coin_award", {
        source: "failed_round_participation",
        amount: result.coinAmount
      });
    }
  };

  const submitScore = async () => {
    setSubmitStatus("submitting");
    setSubmitReason(null);
    const result = await leaderboardService.submit({
      playId,
      score,
      flags: runFlags,
      audit: {
        boardId: board.id,
        seed: board.seed,
        routeCells: currentRoute.map((step) => step.cellId).join(">") || "none",
        routeIngredients: currentRoute.map((step) => step.ingredientId).join(">") || "none",
        routeLength: currentRoute.length,
        movesUsed: gameState.movesUsed,
        rescuedCount: gameState.rescuedCount,
        completedRecipes: gameState.completedRecipeIds.join(",") || "none",
        scoreBreakdownReceipt: scoreBreakdownReceipt(gameState.breakdown)
      }
    });

    if (result.ok) {
      audioController.play("leaderboard_submit");
      hapticsController.play("leaderboard_submit");
    }

    setSubmitReason(result.reason ?? result.errorCode ?? null);
    setSubmitStatus(result.ok ? "success" : result.skipped ? "skipped" : "error");
  };

  const openLeaderboard = async () => {
    setLeaderboardOpenStatus("opening");
    const result = await leaderboardService.open("result_panel");

    setLeaderboardOpenStatus(result.ok ? "opened" : "error");
  };

  const shareResult = async () => {
    setShareStatus("sharing");
    const result = await resultShareService.shareResult({
      playId,
      score,
      boardTitle: board.title,
      rankedMode: cleanRun,
      url: getResultShareUrl()
    });

    if (result.ok) {
      audioController.play("result_share");
      hapticsController.play("result_share");
    }

    setShareStatus(result.ok ? "success" : "error");
  };

  const sendFriendChallenge = async () => {
    setFriendChallengeStatus("sending");
    trackEvent("friend_challenge_open", {
      source: "result_panel",
      board_id: board.id
    });

    const shareResult = await resultShareService.shareResult({
      playId,
      score,
      boardTitle: board.title,
      rankedMode: cleanRun,
      url: getResultShareUrl()
    });

    if (!shareResult.ok) {
      trackEvent("friend_challenge_send", {
        board_id: board.id,
        status: "error",
        reward_id: shareRewardId(dailyRunKey)
      });
      setFriendChallengeStatus("error");
      return;
    }

    audioController.play("result_share");
    hapticsController.play("result_share");

    const rewardResult = claimShareReward({
      rewardId: shareRewardId(dailyRunKey),
      playId,
      boardId: board.id,
      coinAmount: FRIEND_CHALLENGE_COIN_REWARD
    });

    if (rewardResult.result) {
      setRewardWallet(rewardResult.result.wallet);
    }

    const status = rewardResult.ok
      ? "rewarded"
      : rewardResult.reason === "DUPLICATE_REWARD_ID"
        ? "shared"
        : "blocked";

    trackEvent("friend_challenge_send", {
      board_id: board.id,
      status,
      reward_id: shareRewardId(dailyRunKey)
    });
    setFriendChallengeStatus(status === "blocked" ? "error" : status);
  };

  return (
    <main
      className={`app-shell ${reduceMotion ? "app-shell--reduce-motion" : ""} ${isPaused ? "app-shell--paused" : ""} ${
        profileGateLocked ? "app-shell--profile-locked" : ""
      }`}
    >
      <section className="phone-frame" aria-label="오늘의 냉장고 게임">
        <header className="main-hero" aria-label="오늘의 냉장고 메인 화면">
          <div className="top-bar">
            <div className="brand-lockup">
              <span className="brand-lockup__icon" aria-hidden="true">
                🍳
              </span>
              <div>
                <p className="eyebrow">오늘의 냉장고</p>
                <h1>{board.title}</h1>
              </div>
            </div>
            <div className="top-actions">
              <button
                className="icon-button"
                type="button"
                aria-label={muted ? "소리 켜기" : "소리 끄기"}
                aria-pressed={muted}
                data-testid="mute-button"
                onClick={toggleMuted}
              >
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="모션 줄이기"
                aria-pressed={reduceMotion}
                data-testid="reduce-motion-button"
                onClick={toggleReduceMotion}
              >
                <Waves size={20} />
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label={isPaused ? "계속하기" : "일시정지"}
                aria-pressed={isPaused}
                onClick={isPaused ? resumeGame : pauseGame}
                disabled={gameState.status !== "playing" || profileGateLocked}
                data-testid="pause-button"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
            </div>
          </div>

          <section className="goal-strip" aria-label="오늘의 목표">
            <div className="goal-strip__art" aria-hidden="true">
              <span className="fridge-mascot">
                <span className="fridge-mascot__face" />
                <span className="fridge-mascot__handle" />
              </span>
            </div>
            <div className="goal-strip__copy">
              <span className="goal-strip__label">오늘의 냉파 미션</span>
              <strong>{recipe.name}</strong>
              <p>{recipe.ingredientIds.map((id) => getIngredient(id).name).join(" + ")} 쏙쏙 담기</p>
              <div className="goal-strip__ingredients" aria-hidden="true">
                {recipe.ingredientIds.map((id) => {
                  const ingredient = getIngredient(id);

                  return <span key={id}>{ingredient.icon}</span>;
                })}
              </div>
            </div>
            <div className="goal-strip__actions">
              <Trophy size={24} aria-hidden="true" />
              <button
                className="icon-button icon-button--compact"
                type="button"
                aria-label="레시피북 열기"
                data-testid="recipe-book-open"
                onClick={() => setRecipeBookOpen(true)}
              >
                <BookOpen size={18} />
              </button>
            </div>
          </section>

          <section className="score-strip" aria-label="현재 점수">
            <div>
              <span>점수</span>
              <strong data-testid="score-value">{score.toLocaleString()}</strong>
            </div>
            <div>
              <span>이동</span>
              <strong>
                {gameState.movesUsed}/{board.moveLimit}
              </strong>
            </div>
            <div>
              <span>구출</span>
              <strong>
                {gameState.rescuedCount}/{board.rescueTarget}
              </strong>
            </div>
          </section>

          <section className="competition-strip" aria-label="오늘 기록">
            <div>
              <span>내 최고</span>
              <strong data-testid="personal-best-value">{personalBest.toLocaleString()}</strong>
            </div>
            <div className={bestChase.state === "ahead" ? "competition-strip__item--ahead" : ""} data-testid="best-chase">
              <span data-testid="best-chase-label">{bestChase.label}</span>
              <strong data-testid="best-chase-value">{bestChase.value}</strong>
            </div>
          </section>

          <div className="status-row main-dock">
            <section
              className={`profile-gate profile-gate--${profileGateStatus}`}
              aria-live="polite"
              data-testid="profile-gate"
            >
              <strong>{profileGate.title}</strong>
              <span>{profileGate.message}</span>
            </section>

            <section className="daily-refresh-strip" aria-label="다음 냉장고" data-testid="daily-refresh-strip">
              <span>다음 냉장고</span>
              <strong data-testid="daily-refresh-countdown">{dailyRefreshInfo.remainingLabel}</strong>
              <div className="daily-refresh-strip__meta">
                <small data-testid="daily-streak">연속 {dailyStreak.streakDays}일</small>
                <small data-testid="daily-refresh-time">{dailyRefreshInfo.refreshTimeLabel}</small>
              </div>
            </section>

            <section className="recipe-dock" aria-label="레시피북 진행" data-testid="recipe-dock">
              <span>레시피북</span>
              <strong data-testid="hero-recipe-piece-progress">
                {recipePieceProgress}/{recipePieceTarget}
              </strong>
              <div className="recipe-dock__icons" aria-hidden="true">
                {recipe.ingredientIds.map((id) => (
                  <i key={`dock-${id}`}>{getIngredient(id).icon}</i>
                ))}
              </div>
            </section>
          </div>
        </header>

        {bestRoute && gameState.status === "playing" ? (
          <section
            className={bestRouteProgress?.state === "off" ? "best-route-strip best-route-strip--off" : "best-route-strip"}
            aria-label="최고 루트 미리보기"
            data-testid="best-route-strip"
          >
            <span data-testid="best-route-strip-label">{bestRouteStatusLabel}</span>
            <div>
              {bestRoute.steps.map((step, index) => (
                <i key={`${step.cellId}-preview-${index}`} aria-label={getIngredient(step.ingredientId).name}>
                  {getIngredient(step.ingredientId).icon}
                </i>
              ))}
            </div>
          </section>
        ) : null}

        <p className="coach-message" data-testid="coach-message">
          {gameState.message}
        </p>

        {tutorialStep !== "done" ? (
          <section className="tutorial-strip" data-testid="tutorial-strip" aria-label="첫 판 힌트">
            <span>{tutorialCopy[tutorialStep]}</span>
            <button
              className="tutorial-skip"
              type="button"
              aria-label="첫 판 힌트 닫기"
              onClick={() => setTutorialStep("done")}
            >
              <X size={18} />
            </button>
          </section>
        ) : null}

        <section className="hint-row" aria-label="첫 플레이 힌트">
          <span>같은 재료 3개</span>
          <span>임박 먼저</span>
          <span>밥+김치+계란</span>
        </section>

        <section className="fridge-board" aria-label="냉장고 보드" data-testid="fridge-board">
          {gameState.board.map((cell) => (
            <IngredientTile
              key={cell.id}
              instance={cell.front}
              hiddenBack={Boolean(cell.back)}
              blocked={cell.blocked}
              highlighted={highlightedCells.has(cell.id)}
              disabled={isPaused || profileGateLocked}
              onClick={() => selectCell(cell)}
            />
          ))}
        </section>

        <section className="tray" aria-label="준비대" data-testid="prep-tray">
          <span className="tray__label">준비대</span>
          {Array.from({ length: board.traySlots }).map((_, index) => (
            <TraySlot key={index} instance={gameState.tray[index]} />
          ))}
        </section>

        <section className="booster-row" aria-label="부스터">
          <button type="button" disabled>
            정리집게
          </button>
          <button type="button" disabled>
            냉동칸
          </button>
          <button
            type="button"
            onClick={useHintBooster}
            disabled={gameState.status !== "playing" || isPaused || profileGateLocked}
            data-testid="hint-booster"
          >
            힌트
          </button>
        </section>

        {isPaused ? (
          <section className="pause-panel" aria-live="polite" data-testid="pause-panel">
            <h2>잠시 쉬는 중</h2>
            <p>냉장고는 그대로 멈춰 있어요.</p>
            <button className="primary-action" type="button" onClick={resumeGame} data-testid="resume-button">
              계속하기
            </button>
          </section>
        ) : null}

        {!cleanRun ? (
          <p className="fairness-note" data-testid="fairness-note">
            힌트 사용: 오늘 랭킹 제출 제외
          </p>
        ) : null}

        {gameState.status !== "playing" ? (
          <section className="result-panel" aria-live="polite">
            <h2>{gameState.status === "complete" ? "김치볶음밥 완성!" : "한 수만 더 깔끔했어요"}</h2>
            <strong className="result-score">{score.toLocaleString()}점</strong>
            <p className="score-tier" data-testid="score-tier">
              냉파 등급 <strong>{scoreTier}</strong>
            </p>
            <p className="attempt-note" data-testid="attempt-note">
              오늘 {attemptNo.toLocaleString()}번째 도전
            </p>
            <div className="mission-summary" data-testid="mission-summary">
              <div className="mission-summary__header">
                <span>오늘 미션</span>
                <strong data-testid="mission-summary-count">
                  {completedMissionCount}/{missionRows.length}
                </strong>
              </div>
              <div className="mission-summary__list">
                {missionRows.map((row) => (
                  <span
                    className={row.complete ? "mission-summary__item mission-summary__item--complete" : "mission-summary__item"}
                    aria-label={`${row.label} ${row.complete ? "완료" : "미완료"}`}
                    data-testid={`mission-${row.id}`}
                    key={row.id}
                  >
                    {row.label}
                  </span>
                ))}
              </div>
            </div>
            {lastBestDelta !== null ? (
              <p className="best-note" data-testid="best-note">
                {lastBestDelta > 0
                  ? `내 최고 기록 +${lastBestDelta.toLocaleString()}`
                  : `내 최고 ${personalBest.toLocaleString()}점`}
              </p>
            ) : null}
            {bestRoute ? (
              <div className="best-route" data-testid="best-route">
                <span>최고 루트 {bestRoute.steps.length}수</span>
                <div>
                  {bestRoute.steps.map((step, index) => (
                    <i key={`${step.cellId}-${index}`} aria-label={getIngredient(step.ingredientId).name}>
                      {getIngredient(step.ingredientId).icon}
                    </i>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="score-breakdown">
              {scoreRows(gameState.breakdown)
                .filter(([, value]) => value !== 0)
                .map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>
                      {Number(value) > 0 ? "+" : ""}
                      {Number(value).toLocaleString()}
                    </strong>
                  </div>
                ))}
            </div>
            <div className="reward-summary" data-testid="reward-summary">
              <div>
                <span>냉장고 코인</span>
                <strong data-testid="coin-balance">{rewardWallet.fridgeCoins.toLocaleString()}</strong>
              </div>
              <div>
                <span>레시피 조각</span>
                <strong data-testid="recipe-piece-balance">{recipePieceCount.toLocaleString()}</strong>
              </div>
            </div>
            <div className="recipe-progress" data-testid="recipe-progress">
              <div className="recipe-progress__title">
                <span>레시피북</span>
                <strong>{recipe.name}</strong>
              </div>
              <span className="recipe-progress__count" data-testid="recipe-piece-progress">
                {recipePieceProgress}/{recipePieceTarget}
              </span>
              <div
                className="recipe-progress__bar"
                role="progressbar"
                aria-label={`${recipe.name} 레시피 조각`}
                aria-valuenow={recipePieceProgress}
                aria-valuemin={0}
                aria-valuemax={recipePieceTarget}
              >
                <span style={{ width: recipePieceProgressPercent }} />
              </div>
            </div>
            <button className="primary-action" type="button" onClick={restart} data-testid="restart-button">
              다시 도전
            </button>
            {gameState.status === "complete" ? (
              <>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={claimReward}
                  disabled={completionRewardClaimed}
                  data-testid="reward-claim"
                >
                  {completionRewardClaimed || rewardStatus === "claimed" ? "참여 보상 받음" : "참여 보상 받기"}
                </button>
                <button
                  className="secondary-action secondary-action--with-icon"
                  type="button"
                  onClick={shareResult}
                  disabled={shareStatus === "sharing"}
                  data-testid="result-share"
                >
                  <Share2 size={18} aria-hidden="true" />
                  <span>
                    {shareStatus === "success"
                      ? "결과 공유됨"
                      : shareStatus === "sharing"
                        ? "공유 준비 중"
                        : shareStatus === "error"
                          ? "공유 실패"
                          : "결과 공유"}
                  </span>
                </button>
                <button
                  className="secondary-action secondary-action--with-icon"
                  type="button"
                  onClick={sendFriendChallenge}
                  disabled={friendChallengeStatus === "sending"}
                  data-testid="friend-challenge"
                >
                  <Share2 size={18} aria-hidden="true" />
                  <span>{friendChallengeLabel}</span>
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={submitScore}
                  disabled={profileGateLocked || submitStatus === "submitting" || submitStatus === "success"}
                  data-testid="leaderboard-submit"
                >
                  {submitStatus === "success"
                    ? "기록 제출 완료"
                    : submitStatus === "submitting"
                      ? "기록 제출 중"
                      : "오늘의 기록 제출"}
                </button>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={openLeaderboard}
                  disabled={leaderboardOpenStatus === "opening"}
                  data-testid="leaderboard-open"
                >
                  {leaderboardOpenStatus === "opened"
                    ? "랭킹 열림"
                    : leaderboardOpenStatus === "opening"
                      ? "랭킹 여는 중"
                      : "랭킹 보기"}
                </button>
              </>
            ) : null}
            {gameState.status === "failed" ? (
              <button
                className="secondary-action"
                type="button"
                onClick={claimFailureReward}
                disabled={participationRewardClaimed}
                data-testid="failure-reward-claim"
              >
                {participationRewardClaimed || rewardStatus === "claimed" ? "참여 코인 받음" : "참여 코인 받기"}
              </button>
            ) : null}
            {submitStatus === "skipped" || submitStatus === "error" ? (
              <p className="submit-note" data-testid="submit-note">
                {submitStatus === "skipped"
                  ? submitReason === GAME_USER_KEY_UNAVAILABLE
                    ? "토스 게임 프로필 확인이 필요해요. 잠시 후 다시 시도해 주세요."
                    : "기록 제출은 clean ranked 판에서만 가능해요."
                  : "기록 제출이 잠시 실패했어요. 다시 시도해 주세요."}
              </p>
            ) : null}
          </section>
        ) : null}
      </section>
      {recipeBookOpen ? (
        <RecipeBookPanel
          wallet={rewardWallet}
          activeRecipeId={recipe.id}
          pieceTarget={recipePieceTarget}
          onClose={() => setRecipeBookOpen(false)}
        />
      ) : null}
      <AnalyticsQaPanel enabled={analyticsQaEnabled} />
    </main>
  );
};
