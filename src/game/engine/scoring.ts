import type { GameState, ScoreBreakdown } from "../types";

export const SCORE = {
  matchClear: 100,
  expiringRescue: 80,
  unrescuedExpiringPenalty: 120,
  remainingTraySlot: 30,
  zeroWasteBonus: 500,
  unusedMoveBonus: 10,
  unusedMoveBonusCap: 100,
  comboMultipliers: [1, 1.2, 1.4, 1.6]
} as const;

export const emptyBreakdown = (): ScoreBreakdown => ({
  clearPoints: 0,
  recipePoints: 0,
  rescueBonus: 0,
  comboBonus: 0,
  remainingTrayBonus: 0,
  zeroWasteBonus: 0,
  moveEfficiencyBonus: 0,
  wastePenalty: 0
});

export const getComboMultiplier = (comboIndex: number): number => {
  const cappedIndex = Math.min(comboIndex, SCORE.comboMultipliers.length - 1);
  return SCORE.comboMultipliers[cappedIndex];
};

export const addClearPoints = (
  breakdown: ScoreBreakdown,
  basePoints: number,
  comboIndex: number,
  bucket: "clearPoints" | "recipePoints"
): ScoreBreakdown => {
  const multiplier = getComboMultiplier(comboIndex);
  const total = Math.round(basePoints * multiplier);
  const comboBonus = total - basePoints;

  return {
    ...breakdown,
    [bucket]: breakdown[bucket] + basePoints,
    comboBonus: breakdown.comboBonus + comboBonus
  };
};

export const totalScore = (breakdown: ScoreBreakdown): number =>
  breakdown.clearPoints +
  breakdown.recipePoints +
  breakdown.rescueBonus +
  breakdown.comboBonus +
  breakdown.remainingTrayBonus +
  breakdown.zeroWasteBonus +
  breakdown.moveEfficiencyBonus -
  breakdown.wastePenalty;

export const finalizeScore = (state: GameState, moveLimit: number, traySlots: number): ScoreBreakdown => {
  const unrescuedExpiring = state.board.filter((cell) => cell.front?.state === "expiring" || cell.back?.state === "expiring")
    .length;
  const remainingTraySlots = Math.max(0, traySlots - state.tray.length);
  const unusedMoves = Math.max(0, moveLimit - state.movesUsed);

  return {
    ...state.breakdown,
    remainingTrayBonus: remainingTraySlots * SCORE.remainingTraySlot,
    zeroWasteBonus: unrescuedExpiring === 0 ? SCORE.zeroWasteBonus : 0,
    moveEfficiencyBonus: Math.min(SCORE.unusedMoveBonusCap, unusedMoves * SCORE.unusedMoveBonus),
    wastePenalty: unrescuedExpiring * SCORE.unrescuedExpiringPenalty
  };
};

