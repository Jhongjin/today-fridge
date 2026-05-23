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

- Blocked locally: exact package install for `@apps-in-toss/web-framework@2.6.0` timed out at 5 and 10 minutes in the Windows workspace without updating package files.
- Implement `TossClient` using official SDK.
- Keep `tossMockClient` for browser/CI.
- Add runtime adapter selection.
- Add game user key status analytics through `TossClient.getUserKey()`. (Phase 83 bridge path done)
- Add typed error codes.

Output:

- `src/platform/tossRealClient.ts`
- Unit tests with mocked SDK boundary.

## Queue 3: Profile Gate

- Add game profile required pre-play gate.
- Ensure users without profile cannot start ranked play. (Phase 86 blocks clean leaderboard submit when game user key is unavailable; full pre-play profile UI still pending)
- Keep local mock path for CI.

Output:

- UI profile gate.
- Browser mock tests.

## Queue 4: Leaderboard Open Flow

- Connect result-screen leaderboard open.
- Keep submit after round end only.
- Prevent duplicate submit per play ID.

Output:

- UI and platform tests.

## Queue 5: Share Reward

- Add friend challenge/share entry.
- Reward only fixed non-ranked in-game items.
- No clean ranked advantage.
- Pass `externalRewardPolicy` before granting. (Phase 88 guard done)

Output:

- Share mock scenarios.
- Policy review note.

## Queue 6: Ads And Promotion

- Add rewarded ad stubs and real adapters.
- Add promotion fixed-action hooks only.
- Confirm no score/rank/win/random dependency.
- Pass `externalRewardPolicy` before granting. (Phase 88 guard done)

Output:

- Ad/promotion mock tests.
- Review checklist update.
