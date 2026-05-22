# REVIEW_GATES

These gates decide whether the project can move from one phase to the next.

## Gate 0: Strategy Lock

Required documents:

- `docs/strategy/STRATEGY_LOCK.md`
- `harness/COMMAND_CENTER.md`
- `agents/ROSTER.md`

Pass criteria:

- The concept is still a fridge-cleaning puzzle.
- The first playable action is designed for 5-second understanding.
- The target remains Toss casual users, especially women in their 40s-50s.
- Leaderboard fairness and Toss point separation are explicit.

## Gate 1: Prototype Brief

Required before implementation:

- Tutorial board spec.
- First daily board seed.
- Ingredient list.
- First 20 recipes.
- Score formula constants.
- UX wireframe.

Pass criteria:

- One round can be played in 60-90 seconds.
- No mechanic requires long reading.
- The first board is solvable without boosters.
- A fixed seed can reproduce the same board and score.

## Gate 2: Playable Prototype

Required:

- Local dev server.
- Mobile viewport playable screen.
- Tutorial completion.
- One fixed daily board.
- Local score calculation.

Pass criteria:

- No text overlap at 360x740, 390x844, 430x932.
- A full round can be completed.
- Same move sequence produces the same score.
- Player can mute sound.
- Console has no blocking errors.

## Gate 3: Toss Mock Harness

Required:

- Toss SDK wrapper.
- Mock user key.
- Mock leaderboard submit/open.
- Mock share reward event.
- Mock rewarded ad event.
- Mock promotion response.

Pass criteria:

- SDK failures do not trap the player.
- Leaderboard submit is idempotent per play session.
- Ads, shares, and promotions do not affect ranked fairness.
- Promotion rewards are not tied to score, rank, win/loss, or random chance.

## Gate 4: Submission Readiness

Required:

- Real device QR test.
- Bundle size review.
- Safe area review.
- Error monitoring plan.
- Rollback path.

Pass criteria:

- Toss app game flow works on supported iOS and Android versions.
- The game reaches first playable UI within target load time.
- QA blockers in `docs/platform/TOSS_QA_HARNESS.md` are closed.

