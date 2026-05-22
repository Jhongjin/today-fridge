import { Pause, Trophy, Volume2, VolumeX, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createAudioController } from "../audio/audioController";
import { firstDailyBoard } from "../game/data/boards";
import { getIngredient } from "../game/data/ingredients";
import { getRecipe } from "../game/data/recipes";
import { createInitialState, selectIngredient } from "../game/engine/gameEngine";
import { SCORE, totalScore } from "../game/engine/scoring";
import type { BoardCell, IngredientInstance } from "../game/types";
import { getAnalyticsContext, trackEvent } from "../platform/analytics";
import { cleanRankedFlags } from "../platform/fairness";
import { createLeaderboardService } from "../platform/leaderboard";
import { createTossMockClient } from "../platform/tossMockClient";

const board = firstDailyBoard;

const createPlayId = () => `${board.seed}-${Date.now()}`;

const getLoadMs = () => (typeof performance !== "undefined" ? Math.round(performance.now()) : 0);

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

const IngredientTile = ({
  instance,
  hiddenBack,
  blocked,
  onClick
}: {
  instance?: IngredientInstance;
  hiddenBack?: boolean;
  blocked?: boolean;
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
      className={`tile tile--${instance.state}`}
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
  const recipe = getRecipe(board.mainRecipeId);
  const score = totalScore(gameState.breakdown);
  const leaderboardService = useMemo(() => createLeaderboardService(createTossMockClient()), []);
  const audioController = useMemo(() => createAudioController(), []);

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

  const selectCell = (cell: BoardCell) => {
    setGameState((current) => {
      const next = selectIngredient(current, board, cell.id);

      if (next !== current) {
        const selectedIngredientId = cell.front?.ingredientId ?? null;

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
          audioController.play("match_clear");
        }

        if (next.lastClear?.type === "recipe") {
          trackEvent("recipe_complete", {
            play_id: playId,
            recipe_id: next.lastClear.recipeId,
            points: next.lastClear.points
          });
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
          trackEvent("round_complete", {
            play_id: playId,
            score: totalScore(next.breakdown),
            duration_ms: Math.max(0, Date.now() - roundStartedAt),
            moves_used: next.movesUsed,
            recipe_count: next.completedRecipeIds.length,
            rescued_count: next.rescuedCount
          });
          audioController.play("round_complete");
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
      }

      return next;
    });
  };

  const restart = () => {
    const nextAttemptNo = attemptNo + 1;
    const nextPlayId = createPlayId();

    trackRoundStart(nextPlayId, nextAttemptNo);
    setGameState(createInitialState(board));
    setPlayId(nextPlayId);
    setAttemptNo(nextAttemptNo);
    setRoundStartedAt(Date.now());
    setSubmitStatus("idle");
  };

  const submitScore = async () => {
    setSubmitStatus("submitting");
    const result = await leaderboardService.submit({
      playId,
      score,
      flags: cleanRankedFlags()
    });

    if (result.ok) {
      audioController.play("leaderboard_submit");
    }

    setSubmitStatus(result.ok ? "success" : result.skipped ? "skipped" : "error");
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

        <section className="goal-strip" aria-label="오늘의 목표">
          <div>
            <span className="goal-strip__label">목표</span>
            <strong>{recipe.name}</strong>
            <p>{recipe.ingredientIds.map((id) => getIngredient(id).name).join(" + ")}</p>
          </div>
          <Trophy size={28} aria-hidden="true" />
        </section>

        <p className="coach-message" data-testid="coach-message">
          {gameState.message}
        </p>

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
          <button type="button">정리집게</button>
          <button type="button">냉동칸</button>
          <button type="button">힌트</button>
        </section>

        {gameState.status !== "playing" ? (
          <section className="result-panel" aria-live="polite">
            <h2>{gameState.status === "complete" ? "김치볶음밥 완성!" : "한 수만 더 깔끔했어요"}</h2>
            <strong className="result-score">{score.toLocaleString()}점</strong>
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
            <button className="primary-action" type="button" onClick={restart}>
              다시 도전
            </button>
            {gameState.status === "complete" ? (
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
            ) : null}
            {submitStatus === "skipped" || submitStatus === "error" ? (
              <p className="submit-note">기록 제출은 clean ranked 판에서만 가능해요.</p>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
};
