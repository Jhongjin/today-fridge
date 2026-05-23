# PLATFORM_ADAPTER

## 1. Purpose

The platform adapter keeps game logic independent from Toss SDK details.

Game engine code should never call Toss APIs directly. It should emit completed score and fairness flags. Platform services decide whether and how to submit, share, advertise, or reward.

## 2. Current Adapter Files

| File | Role |
| --- | --- |
| `src/platform/tossClient.ts` | Shared Toss client interface and browser fallback |
| `src/platform/tossMockClient.ts` | Local/CI mock client |
| `src/platform/fairness.ts` | Ranked score eligibility flags |
| `src/platform/leaderboard.ts` | Idempotent clean score submission service |
| `src/platform/analytics.ts` | Temporary event buffer for tests and prototypes |

## 3. Clean Ranked Score Rule

Clean leaderboard submit is allowed only when:

```text
rankedMode == true
boosterUsed == false
adRecoveryUsed == false
shareBonusUsed == false
gameUserKey is available
```

Any assisted run can still:

- Complete the board.
- Earn collection progress.
- Earn non-rank participation rewards.
- Show a result screen.

But it must not overwrite clean ranked score.

If the platform cannot provide a game user key, leaderboard submission returns:

```text
ok: false
skipped: true
reason: GAME_USER_KEY_UNAVAILABLE
```

## 4. Idempotency Rule

Each `playId` can submit at most once through the leaderboard service.

Duplicate submit attempts return:

```text
ok: false
skipped: true
reason: DUPLICATE_PLAY_ID
```

## 5. Toss SDK Integration Plan

Later real integration should implement `TossClient` with:

- game user key retrieval.
- leaderboard score submit.
- leaderboard open.
- share reward module.
- rewarded ad module.
- promotion module.

Each SDK call should:

- Return typed success/error results.
- Track analytics.
- Avoid throwing into UI flow unless unrecoverable.
- Have mock parity for CI.

## 6. QA Requirements

- Unit tests for eligibility rules.
- Unit tests for duplicate submit.
- Browser test for result screen submit flow once the UI button is connected.
- Real device test for Toss SDK behavior before submission.
