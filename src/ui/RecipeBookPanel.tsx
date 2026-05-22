import { X } from "lucide-react";
import { getIngredient } from "../game/data/ingredients";
import { recipes } from "../game/data/recipes";
import type { RewardWallet } from "../platform/rewards";

export const RecipeBookPanel = ({
  wallet,
  activeRecipeId,
  pieceTarget,
  onClose
}: {
  wallet: RewardWallet;
  activeRecipeId: string;
  pieceTarget: number;
  onClose: () => void;
}) => {
  const recipeList = Object.values(recipes);
  const completedCount = recipeList.filter((item) => (wallet.recipePieces[item.id] ?? 0) >= pieceTarget).length;

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
          const progress = Math.min(pieceCount, pieceTarget);
          const progressPercent = `${Math.round((progress / pieceTarget) * 100)}%`;

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
                  {progress}/{pieceTarget}
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
