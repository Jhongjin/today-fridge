# EXTERNAL_REWARD_POLICY

## Purpose

This policy guards future share rewards, rewarded ads, and Toss promotion points before those SDK features are implemented.

## Allowed Reward Shape

An external reward is allowed only when all conditions are true:

```text
fixed_amount == true
user_initiated == true
affects_clean_ranked_score == false
tied_to_score == false
tied_to_rank == false
tied_to_win_loss == false
random_outcome == false
```

Additional rewarded-ad rule:

```text
interrupts_active_play == false
```

## Block Reasons

| Reason | Meaning |
| --- | --- |
| `AFFECTS_CLEAN_RANKED_SCORE` | Reward would improve score, moves, ranking, or best-route eligibility. |
| `TIED_TO_SCORE` | Reward depends on score threshold or score amount. |
| `TIED_TO_RANK` | Reward depends on leaderboard rank or friend rank. |
| `TIED_TO_WIN_LOSS` | Reward depends on winning, losing, or beating a friend. |
| `RANDOM_OUTCOME` | Reward amount or eligibility is random/probabilistic. |
| `NON_FIXED_AMOUNT` | Reward amount is not fixed before the action. |
| `NOT_USER_INITIATED` | Reward flow starts without an explicit user action. |
| `AD_INTERRUPTS_ACTIVE_PLAY` | Rewarded ad appears during active gameplay. |

## Implementation Boundary

Code guard:

`src/platform/externalRewardPolicy.ts`

Grant harness:

`src/platform/externalRewardGrant.ts`

Current future integrations must call the policy check before granting:

- `contactsViral` share reward.
- Rewarded ad completion reward.
- `grantPromotionRewardForGame`.

The grant harness emits:

| Event | Meaning |
| --- | --- |
| `external_reward_policy_check` | Policy pass/fail for the requested external reward. |
| `external_reward_claim` | Wallet grant result after policy approval. |

Share reward mock service:

`src/platform/shareReward.ts`

This service models a future `contactsViral` `sendViral` reward as a fixed, user-initiated, non-ranked reward and emits `share_reward_event`.

Rewarded ad mock service:

`src/platform/rewardedAd.ts`

This service models a future rewarded ad completion as a fixed, user-initiated, non-ranked reward. It blocks grants when the ad completion event is missing or the request would interrupt active play.

## Today Fridge Rules

- Share rewards may grant fixed fridge coins or recipe pieces after a qualifying share event.
- Rewarded ads may grant fixed non-ranked recovery or collection rewards only after the player opts in.
- Promotion points may be tied only to fixed actions such as first launch, tutorial completion, attendance, or event participation.
- None of these rewards may affect clean leaderboard score, personal best, best route, or ranked eligibility.
