# PHASE_17_BRIEF

## Queue

Failed-round participation reward.

## Goal

Reduce early frustration by letting a failed round end with a small fixed coin claim that is unrelated to score or rank.

## Acceptance Criteria

- Failed result screen shows wallet balances.
- Failed rounds can claim 10 fridge coins once per board.
- Failed participation does not award recipe pieces.
- Reward analytics events use `reward_type=participation`.
- Unit and mobile browser tests cover the failed reward path.

## Commander Notes

This keeps the tone forgiving without creating pay-to-win or rank-based reward pressure.
