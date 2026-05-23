# TOSS_SDK_QUEUE

Purpose:

> Convert the current mock platform layer to real Apps in Toss SDK integration without touching game engine code.

## Queue 1: SDK Research Lock

- Confirm exact package/import path for Apps in Toss SDK. (Phase 87 API map)
- Confirm game profile APIs. (Phase 87 API map)
- Confirm leaderboard submit/open APIs. (Phase 87 API map)
- Confirm game user key API. (Phase 83 mapped `getUserKeyForGame()`, QR validation pending)
- Confirm share reward API. (Phase 87 API map)
- Confirm ad API. (Phase 87 API map)
- Confirm promotion API. (Phase 87 API map)

Output:

- `docs/platform/TOSS_SDK_API_MAP.md` (Phase 87 done pending CI)

## Queue 2: Real Toss Client

- Package dependency locked: `@apps-in-toss/web-framework@2.6.0` is now in `package.json` and `package-lock.json`. (Phase 98 done)
- Track install warnings: Node 24 engine warning, React Native peer overrides, and npm audit findings.
- Implement `TossClient` using official SDK. (Phase 99 wrapper done)
- Keep `tossMockClient` for browser/CI.
- Add runtime adapter selection. (Phase 101 real-client opt-in done)
- Add game user key status analytics through `TossClient.getUserKey()`. (Phase 83 bridge path done)
- Add typed error codes. (Phase 100 done)

Output:

- `src/platform/tossRealClient.ts` (Phase 99 done)
- `src/platform/runtimeTossClient.ts` lazy real-client opt-in through `VITE_TOSS_REAL_CLIENT=true`. (Phase 101 done)
- `src/platform/tossClient.ts` typed leaderboard submit failure codes. (Phase 100 done)
- Unit tests with mocked SDK boundary. (Phase 99 done)

## Queue 3: Profile Gate

- Add game profile required pre-play gate. (Phase 102 done)
- Ensure users without profile cannot start ranked play. (Phase 102 done)
- Keep local mock path for CI.

Output:

- UI profile gate. (Phase 102 done)
- Browser mock tests. (Phase 102 done)

## Queue 4: Leaderboard Open Flow

- Connect result-screen leaderboard open. (Phase 23 done, Phase 103 browser lock done)
- Keep submit after round end only. (Phase 103 browser lock done)
- Prevent duplicate submit per play ID. (Phase 4 service guard, Phase 103 browser lock done)

Output:

- UI and platform tests. (Phase 103 done)

## Queue 5: Share Reward

- Add friend challenge/share entry. (Phase 104 result-screen mock UI done)
- Reward only fixed non-ranked in-game items. (Phase 104 fixed daily share coin done)
- No clean ranked advantage. (Phase 104 browser coverage done)
- Pass `externalRewardPolicy` before granting. (Phase 88 guard done)
- Grant through `externalRewardGrant` after policy approval. (Phase 89 harness done)
- Use `rewardedAd` mock service until real ad SDK is wired. (Phase 91 service done)
- Use `shareReward` mock service until real `contactsViral` is wired. (Phase 90 service done; Phase 106 SDK adapter done, UI wiring pending)
- Keep real external reward runtime behind a separate environment gate. (Phase 107 done)

Output:

- Share mock scenarios. (Phase 104 UI + duplicate reward coverage done)
- Policy review note. (Phase 106 docs updated; real `contactsViral` still QR/device pending)

## Queue 6: Ads And Promotion

- Add rewarded ad stubs and real adapters. (Phase 105 client stub done; Phase 106 SDK adapter done)
- Add promotion fixed-action hooks only. (Phase 105 safe helper done)
- Confirm no score/rank/win/random dependency. (Phase 105 helper coverage done)
- Pass `externalRewardPolicy` before granting. (Phase 88 guard done)
- Grant through `externalRewardGrant` after policy approval. (Phase 89 harness done)
- Use `promotionReward` mock service until real `grantPromotionRewardForGame` is wired. (Phase 92 service done; Phase 106 SDK adapter done, UI wiring pending)
- Keep real ad/promotion runtime behind a separate environment gate. (Phase 107 done)

Output:

- Ad/promotion mock tests. (Phase 93 integrated external reward scenario done; Phase 105 client/hook tests done; Phase 106 SDK adapter tests done)
- Review checklist update. (Phase 106 docs updated; real SDK adapters still QR/device pending)
