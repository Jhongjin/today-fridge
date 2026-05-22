# PHASE_15_BRIEF

## Queue

Hint booster and clean score separation.

## Goal

Make the visible booster row honest and useful while protecting clean leaderboard fairness.

## Acceptance Criteria

- `힌트` highlights one useful next cell.
- Using `힌트` sets the run's `boosterUsed` flag.
- Booster-assisted completion does not update clean personal best.
- Booster-assisted leaderboard submission is skipped by the service.
- Mobile browser tests cover the non-clean path.

## Commander Notes

This keeps the app friendly without letting helper tools become a ranked-score advantage.
