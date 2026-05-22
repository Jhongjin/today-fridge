import { Pause, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { firstDailyBoard } from "../game/data/boards";
import { getIngredient } from "../game/data/ingredients";
import { getRecipe } from "../game/data/recipes";
import { createInitialState, selectIngredient } from "../game/engine/gameEngine";
import { totalScore } from "../game/engine/scoring";
import type { BoardCell, IngredientInstance } from "../game/types";
import { trackEvent } from "../platform/analytics";

const board = firstDailyBoard;

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
  const recipe = getRecipe(board.mainRecipeId);
  const score = totalScore(gameState.breakdown);
  const playId = useMemo(() => `${board.seed}-${Date.now()}`, []);

  const selectCell = (cell: BoardCell) => {
    setGameState((current) => {
      const next = selectIngredient(current, board, cell.id);

      if (next !== current) {
        trackEvent("move_commit", {
          play_id: playId,
          cell_id: cell.id,
          move_no: next.movesUsed,
          score: totalScore(next.breakdown)
        });
      }

      return next;
    });
  };

  const restart = () => {
    trackEvent("round_start", {
      board_id: board.id,
      seed: board.seed,
      ranked_mode: true
    });
    setGameState(createInitialState(board));
  };

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="오늘의 냉장고 게임">
        <header className="top-bar">
          <div>
            <p className="eyebrow">오늘의 냉장고</p>
            <h1>{board.title}</h1>
          </div>
          <button className="icon-button" type="button" aria-label="일시정지">
            <Pause size={20} />
          </button>
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
          </section>
        ) : null}
      </section>
    </main>
  );
};
