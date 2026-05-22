import { BookOpen, Pause, Share2, Trophy, Volume2, VolumeX, Waves, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createAudioController } from "../audio/audioController";
import { createWebAudioOutput } from "../audio/webAudioOutput";
import { firstDailyBoard } from "../game/data/boards";
import { getIngredient } from "../game/data/ingredients";
import { getRecipe, recipes } from "../game/data/recipes";
import { applyKstDailySeed, getMsUntilNextKstRefresh, getNextKstRefreshAt } from "../game/engine/dailySeed";
import { createInitialState, selectIngredient } from "../game/engine/gameEngine";
import { SCORE, totalScore } from "../game/engine/scoring";
import type { BoardCell, IngredientInstance } from "../game/types";
import {
  getAnalyticsContext,
  getTrackedEvents,
  subscribeToTrackedEvents,
  trackEvent,
  type AnalyticsEvent
} from "../platform/analytics";
import { recordDailyStreak } from "../platform/dailyStreak";
import { cleanRankedFlags, getScoreSubmissionEligibility } from "../platform/fairness";
import { createLeaderboardService } from "../platform/leaderboard";
import { readPersonalBest, recordPersonalBest } from "../platform/personalBest";
import {
  claimCompletionReward,
  claimParticipationReward,
  hasClaimedCompletionReward,
  hasClaimedParticipationReward,
  readRewardWallet
} from "../platform/rewards";
import type { RewardWallet } from "../platform/rewards";
import { createMockShareClient, createResultShareService } from "../platform/share";
import { createTossMockClient } from "../platform/tossMockClient";

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

const trackRoundStart = (playId: string, attemptNo: number) => {
  trackEvent("round_start", {
    play_id: playId,
    board_id: board.id,
    seed: board.seed,
    attempt_no: attemptNo,
    ranked_mode: true
  });
};

type TutorialStep = "match" | "recipe" | "done";

const tutorialCopy: Record<Exclude<TutorialStep, "done">, string> = {
  match: "두부 3개 먼저 정리",
  recipe: "밥 + 김치 + 계란 완성"
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

const eventPropertySummary = (event: AnalyticsEvent) =>
  Object.entries(event.properties)
    .slice(0, 2)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(" ");

const AnalyticsQaPanel = ({ enabled }: { enabled: boolean }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => (enabled ? getTrackedEvents() : []));

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return subscribeToTrackedEvents(setEvents);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const recentEvents = events.slice(-8).reverse();

  return (
    <aside className="qa-analytics-panel" data-testid="qa-analytics-panel" aria-label="QA analytics events">
      <div className="qa-analytics-panel__header">
        <strong>QA Events</strong>
        <span data-testid="qa-event-count">{events.length}</span>
      </div>
      <ol data-testid="qa-event-list">
        {recentEvents.map((event, index) => (
          <li key={`${event.event_time}-${event.eventName}-${index}`}>
            <strong>{event.eventName}</strong>
            <span>{eventPropertySummary(event)}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
};

const RecipeBookPanel = ({
  wallet,
  activeRecipeId,
  onClose
}: {
  wallet: RewardWallet;
  activeRecipeId: string;
  onClose: () => void;
}) => {
  const recipeList = Object.values(recipes);
  const completedCount = recipeList.filter((item) => (wallet.recipePieces[item.id] ?? 0) >= recipePieceTarget).length;

  return (
    <section className="recipe-book-panel" data-testid="recipe-book-panel" aria-label="레시피북">
      <header className="recipe-book-panel__header">
        <div>
          <p className="eyebrow">레시피북</p>
          <h2>모은 레시피</h2>
        </div>
        <button className="icon-button" type="button" aria-label="레시피북 닫기" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <div className="recipe-book-summary" data-testid="recipe-book-summary">
        <span>완성 {completedCount.toLocaleString()}</span>
        <strong>{recipeList.length.toLocaleString()}개 중</strong>
      </div>
      <div className="recipe-book-list">
        {recipeList.map((item) => {
          const pieceCount = wallet.recipePieces[item.id] ?? 0;
          const progress = Math.min(pieceCount, recipePieceTarget);
          const progressPercent = `${Math.round((progress / recipePieceTarget) * 100)}%`;

          return (
            <article
              className={`recipe-book-card${item.id === activeRecipeId ? " recipe-book-card--active" : ""}`}
              key={item.id}
              data-testid={`recipe-book-card-${item.id}`}
            >
              <div className="recipe-book-card__title">
                <strong>{item.name}</strong>
                <span>{item.difficulty}</span>
              </div>
              <p>{item.ingredientIds.map((id) => getIngredient(id).name).join(" + ")}</p>
              <div className="recipe-book-card__progress">
                <span>
                  {progress}/{recipePieceTarget}
                </span>
                <div aria-hidden="true">
                  <i style={{ width: progressPercent }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
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
  onClick
}: {
  instance?: IngredientInstance;
  hiddenBack?: boolean;
  blocked?: boolean;
  highlighted?: boolean;
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
  const [muted, setMuted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "skipped" | "error">("idle");
  const [leaderboardOpenStatus, setLeaderboardOpenStatus] = useState<"idle" | "opening" | "opened" | "error">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "success" | "error">("idle");
  const [personalBest, setPersonalBest] = useState(() => readPersonalBest(dailyRunKey));
  const [lastBestDelta, setLastBestDelta] = useState<number | null>(null);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("match");
  const [runFlags, setRunFlags] = useState(cleanRankedFlags);
  const [boosterHintCellId, setBoosterHintCellId] = useState<string | null>(null);
  const [rewardWallet, setRewardWallet] = useState(readRewardWallet);
  const [rewardStatus, setRewardStatus] = useState<"idle" | "claimed" | "already_claimed">("idle");
  const [dailyRefreshInfo, setDailyRefreshInfo] = useState(getDailyRefreshInfo);
  const [dailyStreak] = useState(() => recordDailyStreak(dailyDateKey));
  const [recipeBookOpen, setRecipeBookOpen] = useState(false);
  const recipe = getRecipe(board.mainRecipeId);
  const score = totalScore(gameState.breakdown);
  const bestGap = Math.max(0, personalBest - score);
  const cleanRun = getScoreSubmissionEligibility(runFlags).submittable;
  const recipePieceCount = rewardWallet.recipePieces[recipe.id] ?? 0;
  const recipePieceProgress = Math.min(recipePieceCount, recipePieceTarget);
  const recipePieceProgressPercent = `${Math.round((recipePieceProgress / recipePieceTarget) * 100)}%`;
  const completionRewardClaimed = hasClaimedCompletionReward(dailyRunKey, rewardWallet);
  const participationRewardClaimed = hasClaimedParticipationReward(dailyRunKey, rewardWallet);
  const highlightedCells = useMemo(() => {
    const cellIds = new Set(tutorialStep === "done" ? [] : tutorialHighlightCells[tutorialStep]);

    if (boosterHintCellId) {
      cellIds.add(boosterHintCellId);
    }

    return cellIds;
  }, [boosterHintCellId, tutorialStep]);
  const leaderboardService = useMemo(() => createLeaderboardService(createTossMockClient()), []);
  const resultShareService = useMemo(() => createResultShareService(createMockShareClient()), []);
  const audioController = useMemo(() => createAudioController(createWebAudioOutput()), []);
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
    trackRoundStart(playId, attemptNo);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDailyRefreshInfo(getDailyRefreshInfo());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const selectCell = (cell: BoardCell) => {
    const current = gameState;
    const next = selectIngredient(current, board, cell.id);

    if (next === current) {
      return;
    }

    const selectedIngredientId = cell.front?.ingredientId ?? null;

    if (boosterHintCellId === cell.id) {
      setBoosterHintCellId(null);
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
    }

    if (next.status === "complete" && current.status === "playing") {
      const finalScore = totalScore(next.breakdown);

      if (cleanRun) {
        const bestImproved = finalScore > personalBest;
        const bestDelta = bestImproved ? finalScore - personalBest : 0;
        const nextPersonalBest = Math.max(personalBest, finalScore);

        if (bestImproved) {
          recordPersonalBest(dailyRunKey, finalScore);
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
        duration_ms: Math.max(0, Date.now() - roundStartedAt),
        moves_used: next.movesUsed,
        recipe_count: next.completedRecipeIds.length,
        rescued_count: next.rescuedCount
      });
      audioController.play("round_complete");
      setTutorialStep("done");
    }

    if (next.status === "failed" && current.status === "playing") {
      trackEvent("round_fail", {
        play_id: playId,
        fail_reason: next.movesUsed > board.moveLimit ? "MOVE_LIMIT" : "TRAY_OVERFLOW",
        move_no: next.movesUsed,
        tray_state_hash: trayStateHash(next.tray)
      });
      audioController.play("round_fail");
    }

    setGameState(next);
  };

  const restart = () => {
    const nextAttemptNo = attemptNo + 1;
    const nextPlayId = createPlayId();

    trackRoundStart(nextPlayId, nextAttemptNo);
    setGameState(createInitialState(board));
    setPlayId(nextPlayId);
    setAttemptNo(nextAttemptNo);
    setRoundStartedAt(Date.now());
    setLastBestDelta(null);
    setTutorialStep((step) => (step === "done" ? "done" : "match"));
    setRunFlags(cleanRankedFlags());
    setBoosterHintCellId(null);
    setRewardStatus("idle");
    setSubmitStatus("idle");
    setLeaderboardOpenStatus("idle");
    setShareStatus("idle");
  };

  const useHintBooster = () => {
    if (gameState.status !== "playing") {
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
    const result = await leaderboardService.submit({
      playId,
      score,
      flags: runFlags
    });

    if (result.ok) {
      audioController.play("leaderboard_submit");
    }

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
    }

    setShareStatus(result.ok ? "success" : "error");
  };

  return (
    <main className={`app-shell ${reduceMotion ? "app-shell--reduce-motion" : ""}`}>
      <section className="phone-frame" aria-label="오늘의 냉장고 게임">
        <header className="top-bar">
          <div>
            <p className="eyebrow">오늘의 냉장고</p>
            <h1>{board.title}</h1>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={muted ? "소리 켜기" : "소리 끄기"}
              aria-pressed={muted}
              onClick={() =>
                setMuted((value) => {
                  const nextMuted = !value;
                  audioController.setMuted(nextMuted);
                  return nextMuted;
                })
              }
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="모션 줄이기"
              aria-pressed={reduceMotion}
              onClick={() => setReduceMotion((value) => !value)}
            >
              <Waves size={20} />
            </button>
            <button className="icon-button" type="button" aria-label="일시정지">
              <Pause size={20} />
            </button>
          </div>
        </header>

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
          <div>
            <span>최고까지</span>
            <strong>{bestGap > 0 ? `${bestGap.toLocaleString()}점` : "도전 중"}</strong>
          </div>
        </section>

        <section className="daily-refresh-strip" aria-label="다음 냉장고" data-testid="daily-refresh-strip">
          <span>다음 냉장고</span>
          <strong data-testid="daily-refresh-countdown">{dailyRefreshInfo.remainingLabel}</strong>
          <div className="daily-refresh-strip__meta">
            <small data-testid="daily-streak">연속 {dailyStreak.streakDays}일</small>
            <small data-testid="daily-refresh-time">{dailyRefreshInfo.refreshTimeLabel}</small>
          </div>
        </section>

        <section className="goal-strip" aria-label="오늘의 목표">
          <div>
            <span className="goal-strip__label">목표</span>
            <strong>{recipe.name}</strong>
            <p>{recipe.ingredientIds.map((id) => getIngredient(id).name).join(" + ")}</p>
          </div>
          <div className="goal-strip__actions">
            <Trophy size={28} aria-hidden="true" />
            <button className="icon-button icon-button--compact" type="button" aria-label="레시피북 열기" data-testid="recipe-book-open" onClick={() => setRecipeBookOpen(true)}>
              <BookOpen size={18} />
            </button>
          </div>
        </section>

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
          <button type="button" onClick={useHintBooster} disabled={gameState.status !== "playing"} data-testid="hint-booster">
            힌트
          </button>
        </section>

        {!cleanRun ? (
          <p className="fairness-note" data-testid="fairness-note">
            힌트 사용: 오늘 랭킹 제출 제외
          </p>
        ) : null}

        {gameState.status !== "playing" ? (
          <section className="result-panel" aria-live="polite">
            <h2>{gameState.status === "complete" ? "김치볶음밥 완성!" : "한 수만 더 깔끔했어요"}</h2>
            <strong className="result-score">{score.toLocaleString()}점</strong>
            {lastBestDelta !== null ? (
              <p className="best-note" data-testid="best-note">
                {lastBestDelta > 0
                  ? `내 최고 기록 +${lastBestDelta.toLocaleString()}`
                  : `내 최고 ${personalBest.toLocaleString()}점`}
              </p>
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
            <button className="primary-action" type="button" onClick={restart}>
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
                  className="secondary-action"
                  type="button"
                  onClick={submitScore}
                  disabled={submitStatus === "submitting" || submitStatus === "success"}
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
                기록 제출은 clean ranked 판에서만 가능해요.
              </p>
            ) : null}
          </section>
        ) : null}
      </section>
      {recipeBookOpen ? (
        <RecipeBookPanel wallet={rewardWallet} activeRecipeId={recipe.id} onClose={() => setRecipeBookOpen(false)} />
      ) : null}
      <AnalyticsQaPanel enabled={analyticsQaEnabled} />
    </main>
  );
};
