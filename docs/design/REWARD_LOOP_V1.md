# REWARD_LOOP_V1

## Phase 16 Scope

The MVP now has local fixed rewards:

- Completion: 30 fridge coins and 1 recipe piece for the completed recipe.
- Failed round participation: 10 fridge coins.

Each reward type is claimed once per board id.

## Policy Guardrail

This reward is not tied to:

- Score
- Rank
- Win/loss against friends
- Random chance
- Booster usage

It is a fixed completion reward, so it stays separate from leaderboard competition and Toss point policy risk.

## UX Flow

1. Player completes today's board.
2. Result panel shows wallet balances.
3. Player taps `참여 보상 받기`.
4. Wallet updates immediately.
5. The claim button becomes `참여 보상 받음`.

Failed round:

1. Player fills the tray without a clear.
2. Result panel shows wallet balances.
3. Player taps `참여 코인 받기`.
4. Wallet adds 10 fridge coins.

## Events

- `daily_reward_claim`
- `coin_award`
- `recipe_piece_award`

## Storage

The first implementation uses local storage through `src/platform/rewards.ts`.

Future server-backed storage can keep the same public claim/read behavior.

## Future Queues

- Add recipe book UI.
- Add weekly mission progress.
- Add rewarded-ad extra chest only after result.
