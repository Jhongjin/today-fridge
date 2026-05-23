# PROMOTION_REVIEW_REQUIREMENTS

Checked: 2026-05-23

## Sources

- [Game promotion reward API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/grantPromotionRewardForGame.html)
- [Promotion develop guide](https://developers-apps-in-toss.toss.im/promotion/develop.html)
- [Promotion intro](https://developers-apps-in-toss.toss.im/promotion/intro.html)
- [Promotion console guide](https://developers-apps-in-toss.toss.im/promotion/console.html)
- [Promotion QA guide](https://developers-apps-in-toss.toss.im/promotion/qa.html)

## Hard Rules For Today Fridge

- Promotion rewards can use only fixed user actions:
  - first launch.
  - tutorial completion.
  - attendance.
  - event participation.
- Promotion rewards must never depend on:
  - score.
  - leaderboard rank.
  - win/loss against another user.
  - random, roulette, draw, probability, or chance outcome.
- One user must never receive more than one valid grant for the same promotion condition.
- Promotion point wording must be clearly separated from in-game currency:
  - Use `토스 포인트` only for real Toss point rewards.
  - Use `냉장고 코인` or `레시피 조각` for in-game rewards.
- Promotion rewards must not change clean leaderboard eligibility, personal best score, best route, move count, timer, or score receipt.

## Console And Budget Requirements

- Business and settlement information must be reviewed before promotion setup.
- Business wallet terms and promotion terms must be accepted by the representative admin.
- Biz wallet must be funded before launch.
- Console guide budget range:
  - minimum: 300,000 KRW.
  - maximum: 30,000,000 KRW.
- User-facing reward amount must be within the console policy:
  - all allowed promotion types are within 5,000 Toss points per user.
- Benefit-tab exposure settings must be decided before registration.
  - If a non-exposed promotion later needs exposure, register a new promotion instead of editing the existing one.
- Mission name for benefit-tab exposure should be short and end in `~하기`.

## API Requirements

- API: `grantPromotionRewardForGame({ params: { promotionCode, amount } })`.
- Minimum Toss app version: `5.232.0`.
- Unsupported app versions return `undefined`.
- Supported success returns `{ key }`.
- Failures may return `{ errorCode, message }` or `ERROR`.
- Game category only:
  - non-game mini apps calling this API can receive `40000`.
- A test promotion code must be called at least once before starting the real promotion.
- The promotion guide notes a per-user call limit of 10 calls per minute.

## Error Handling Matrix

| Case | Required behavior |
| --- | --- |
| `undefined` | Show unsupported-version/update guidance. Do not grant local reward. |
| `ERROR` | Show temporary failure. Allow retry without duplicate grant. |
| `40000` | Treat as integration misconfiguration. Block launch. |
| `4100` | Wrong or missing promotion code. Block launch or disable campaign. |
| `4109` | Promotion not active or fully exhausted. Show unavailable/end copy. |
| `4110` | Internal reward grant/revoke error. Retry or offer later-claim path. |
| `4111` | Reward history not found. Log for audit; do not promise success. |
| `4112` | Promotion money shortage. Show unavailable copy and alert operator. |
| `4114` | Single grant amount exceeded. Block launch configuration. |
| `4116` | Maximum grant amount exceeds budget. Block launch configuration. |

## QA Required Before Enabling UI

- Use `TEST_{promotionCode}` once after review approval and before real launch.
- Verify successful grant result without real point deduction in test mode.
- Rapid repeated taps and refreshes must result in one valid grant only.
- Budget exhausted, campaign ended, daily limit, single grant limit, wrong code, timeout, and network failure paths must show recoverable copy.
- Log audit fields:
  - `user_key_status`.
  - `promotion_code`.
  - `amount`.
  - Toss reward key or error code.
  - local reward ID.
  - status.
- Confirm the integrated mock runner:
  - `src/platform/externalRewardScenarios.ts`.
- Confirm policy guard:
  - `src/platform/externalRewardPolicy.ts`.
- Confirm duplicate protection:
  - `src/platform/externalRewardGrant.ts`.

## Current Decision

Promotion points remain hidden from user-facing UI until:

1. QR/device test validates `grantPromotionRewardForGame`.
2. External reward QR evidence and commander review packet are complete.
3. Commander approves budget, copy, and campaign exposure.
4. The promotion has passed console review and at least one test-code call.
