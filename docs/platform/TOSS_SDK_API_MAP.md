# TOSS_SDK_API_MAP

Checked on 2026-05-23 against official Apps in Toss docs.

## Sources

- [Game Center intro](https://developers-apps-in-toss.toss.im/game-center/intro.html)
- [Game Center develop guide](https://developers-apps-in-toss.toss.im/game-center/develop.html)
- [Game leaderboard submit/open](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/submitGameCenterLeaderBoardScore.html)
- [Game user key](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/getUserKeyForGame.html)
- [Contacts viral](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%B9%9C%EA%B5%AC%EC%B4%88%EB%8C%80/contactsViral.html)
- [Integrated full-screen ads](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/IntegratedAd.html)
- [Game promotion reward](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/grantPromotionRewardForGame.html)
- [SDK overview](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0/overview.html)

## Package

Current npm metadata reports:

| Package | Latest observed | Local status |
| --- | --- | --- |
| `@apps-in-toss/web-framework` | `2.6.0` | Exact install still times out in the local Windows workspace. |

The app keeps an injected bridge until package installation and bundle import are unblocked.

## API Map

| Area | Official API | Min Toss app / SDK note | Current status | Today Fridge rule |
| --- | --- | --- | --- | --- |
| Game profile | Platform Game Center profile flow | Profile is required before gameplay. No direct user identifier is returned from profile/leaderboard responses. | Real profile WebView pending. | Do not start final ranked submission unless user identity path is available. |
| Game user key | `getUserKeyForGame()` | Toss app `5.232.0`; returns `{ type: "HASH", hash }`, `INVALID_CATEGORY`, `ERROR`, or `undefined`. | Adapter, QA bridge, analytics status, and leaderboard gate implemented. | Never expose raw hash in UI or QA notes. Use status only in analytics. |
| Leaderboard submit | `submitGameCenterLeaderBoardScore({ score })` | Toss app `5.221.0`; score is a numeric string. | Adapter and result submit UI implemented. | Submit only after round completion, only clean runs, only with game user key. |
| Leaderboard open | `openGameCenterLeaderboard()` | Toss app `5.221.0`; can overlap with profile WebView if called too early. | Result-screen user action implemented. | Never auto-open on entry or immediately after submit. |
| Share reward | `contactsViral({ options, onEvent, onError })` | Toss app `5.223.0`; returns `undefined` below support. | Not implemented. | Reward must be fixed, non-rank, and never improve clean leaderboard score. |
| Share event | `RewardFromContactsViralEvent` | Event type `sendViral` includes reward amount/unit from console. | Not implemented. | Treat as post-action reward evidence, not score advantage. |
| Rewarded/full-screen ads | `loadFullScreenAd`, `showFullScreenAd` | Toss app `5.247.0` for ads 2.0 ver2; `5.227.0` to `5.247.0` has older ads 2.0 support. | Not implemented. | Preload before showing, pause audio, reward only on completed reward event, no ranked advantage. |
| Banner ads | `TossAds` banner APIs | WebView banner support from Toss app `5.241.0`. | Out of MVP scope. | Avoid active-play interruption; use only if later layout can reserve space safely. |
| Game promotion points | `grantPromotionRewardForGame({ params })` | Toss app `5.232.0`; game category only. | Not implemented. | Only fixed action/event rewards. Never score, rank, win/loss, random, or share-win based. |
| App review | `requestReview()` | Toss app iOS/Android `5.253.0`. | Out of MVP scope. | Consider only after repeated successful completions and no active play interruption. |

## Explicit Non-Use For MVP

Future share reward, rewarded ad, and game promotion work must pass `src/platform/externalRewardPolicy.ts` and grant through `src/platform/externalRewardGrant.ts`.

| API family | Reason |
| --- | --- |
| Non-game `getAnonymousKey` | The project is a game mini app and uses `getUserKeyForGame()`. |
| Non-game promotion reward | Use `grantPromotionRewardForGame()` if promotion points are later approved. |
| In-app purchase | Not part of the casual MVP and adds review/payment complexity. |
| Toss login | Game user key is the current identity path for this MVP. |

## Implementation Order

1. Keep the injected bridge stable while package install is blocked.
2. Finish real SDK import in a clean environment or CI path.
3. QR-test game profile creation and returning-user flow.
4. QR-test `getUserKeyForGame()` success/error/unsupported paths.
5. QR-test leaderboard submit/open in sandbox and real QR runtime.
6. Add share reward only if the reward is fixed and non-ranked.
7. Add rewarded ad only after policy, audio lifecycle, and fairness checks are locked.
8. Add game promotion only after commander approves fixed-action reward copy and budget controls.
