# TOSS_SDK_ADAPTER

## Phase 22 Scope

This queue creates the game-center adapter contract for Apps in Toss without bundling the SDK package yet.

Official docs checked on 2026-05-22:

- [Game leaderboard: submit score and open leaderboard](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/submitGameCenterLeaderBoardScore.html)
- [Game Center development guide](https://developers-apps-in-toss.toss.im/game-center/develop.html)

## Official API Shape

Web package:

`@apps-in-toss/web-framework`

Functions:

- `submitGameCenterLeaderBoardScore({ score: string })`
- `openGameCenterLeaderboard()`
- `isMinVersionSupported({ android: "5.221.0", ios: "5.221.0" })`

Minimum Toss app version:

- Android `5.221.0`
- iOS `5.221.0`

## Current Implementation

`src/platform/appsInTossClient.ts` exposes `createAppsInTossClient(bridge)`.

The bridge is intentionally injected so the game can:

- Unit test Toss behavior without the real Toss app.
- Keep local browser and CI builds stable.
- Add the official SDK import in a later queue once dependency installation is unblocked.

## Mapping

Leaderboard submit:

- Local score number is floored.
- Score is sent as a string.
- `SUCCESS` maps to `{ ok: true }`.
- `undefined` maps to `TOSS_VERSION_UNSUPPORTED`.
- Other status codes pass through as `errorCode`.

Leaderboard open:

- Calls `openGameCenterLeaderboard()` only when the bridge exists and the min version check passes.

Game user key:

- The official Game Center guide says user identification is handled by the SDK and not returned in the score response.
- The current `TossClient.getUserKey()` stays `undefined` until a separate profile/user-key flow is confirmed.

## Dependency Note

`npm install @apps-in-toss/web-framework@^2.6.0` timed out twice in the local Windows workspace on 2026-05-22, including a 5-minute attempt. The adapter contract is ready, but the package import/bundle step remains a separate queue.

## Future Queues

- Resolve package installation and bundle the official SDK.
- Replace mock client in production build with `createAppsInTossClient`.
- Add real leaderboard-open result button.
- Add Toss QR test for supported and unsupported app versions.
