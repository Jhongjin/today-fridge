# TOSS_SDK_ADAPTER

## Phase 22 Scope

This queue creates the game-center adapter contract for Apps in Toss without bundling the SDK package yet.

Official docs checked on 2026-05-23:

- [Game leaderboard: submit score and open leaderboard](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/submitGameCenterLeaderBoardScore.html)
- [Game user key](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/getUserKeyForGame.html)
- [Game Center development guide](https://developers-apps-in-toss.toss.im/game-center/develop.html)

The wider SDK queue is mapped in `docs/platform/TOSS_SDK_API_MAP.md`.

## Official API Shape

Web package:

`@apps-in-toss/web-framework`

Functions:

- `submitGameCenterLeaderBoardScore({ score: string })`
- `openGameCenterLeaderboard()`
- `getUserKeyForGame()`
- `isMinVersionSupported({ android: "5.221.0", ios: "5.221.0" })`

Minimum Toss app version:

- Android `5.221.0`
- iOS `5.221.0`

Game user key minimum Toss app version:

- Android `5.232.0`
- iOS `5.232.0`

## Current Implementation

`src/platform/appsInTossClient.ts` exposes `createAppsInTossClient(bridge)`.

`src/platform/tossRealClient.ts` imports official SDK functions from `@apps-in-toss/web-framework` and adapts them through the same `createAppsInTossClient` boundary.

The bridge is intentionally injected so the game can:

- Unit test Toss behavior without the real Toss app.
- Keep local browser and CI builds stable.
- Add the official SDK import in a later queue while preserving the same adapter contract.

`src/platform/runtimeTossClient.ts` now selects the platform client:

- If `globalThis.__TODAY_FRIDGE_TOSS_BRIDGE__` exists, the app uses `createAppsInTossClient`.
- If `VITE_TOSS_REAL_CLIENT=true`, the app lazily loads `createTossRealClient()` and uses the official SDK wrapper.
- Otherwise, the app uses the local mock client for browser, CI, and normal preview stability.
- This keeps the UI wired to the same service boundary while real SDK runtime activation remains an explicit QR-candidate build choice.

## Mapping

Leaderboard submit:

- Local score number is floored.
- Score is sent as a string.
- The local leaderboard service first checks `TossClient.getUserKey()`.
- Missing game user key maps to `GAME_USER_KEY_UNAVAILABLE` and does not call `submitGameCenterLeaderBoardScore`.
- `SUCCESS` maps to `{ ok: true }`.
- `undefined` maps to `TOSS_VERSION_UNSUPPORTED`.
- Known failure status codes pass through as typed `errorCode`.
- Unknown status codes map to `TOSS_LEADERBOARD_SUBMIT_FAILED`.

Typed `TossClient` submit failure codes:

- `DUPLICATE_PLAY_ID`
- `LEADERBOARD_NOT_FOUND`
- `PROFILE_NOT_FOUND`
- `TOSS_LEADERBOARD_SUBMIT_EXCEPTION`
- `TOSS_LEADERBOARD_SUBMIT_FAILED`
- `TOSS_SDK_UNAVAILABLE`
- `TOSS_VERSION_UNSUPPORTED`
- `UNPARSABLE_SCORE`

Leaderboard open:

- Calls `openGameCenterLeaderboard()` only when the bridge exists and the min version check passes.

Game user key:

- Calls `getUserKeyForGame()` only when the bridge exists and the game user key min version check passes.
- `{ type: "HASH", hash }` maps to the platform `TossClient.getUserKey()` string.
- `INVALID_CATEGORY`, `ERROR`, `undefined`, empty hashes, and thrown exceptions map to `undefined` so gameplay can continue.
- App startup records `game_user_key_result` with `ready`, `mock`, `unavailable`, or `error` and updates the shared analytics `user_key_status`.

Real QR validation is still required because the current app uses the injected bridge or local mock until official SDK imports are wired.

Phase 99 note:

- The official SDK import wrapper now compiles and has unit coverage.
- Runtime selection still prefers the injected QA bridge or local mock until QR/device testing approves switching to the real client.

Phase 100 note:

- `src/platform/tossClient.ts` now owns the typed submit failure-code list.
- The Apps in Toss adapter normalizes unexpected SDK status codes to `TOSS_LEADERBOARD_SUBMIT_FAILED`.
- Leaderboard service error results now use the typed Toss client error surface instead of arbitrary strings.

Phase 101 note:

- Runtime selection now has a real SDK opt-in through `VITE_TOSS_REAL_CLIENT=true`.
- The injected QA bridge still wins over the real SDK flag, so browser automation remains deterministic.
- The real SDK client is lazy-loaded and fails closed: missing user key resolves unavailable, submit returns `TOSS_SDK_UNAVAILABLE`, leaderboard open is caught by the service, and failed lazy loads can retry on the next action.

## Dependency Note

`npm view @apps-in-toss/web-framework version` confirms `2.6.0` is available from npm.

Current npm metadata on 2026-05-23:

- Version: `2.6.0`
- Unpacked size: `27,657,338` bytes
- Dependency family: `@apps-in-toss/*` `2.6.0`, `@granite-js/*` `1.0.20`, `brick-module@0.5.2`

Historical install attempts in the local Windows workspace timed out:

- Earlier `npm install @apps-in-toss/web-framework@^2.6.0` attempts timed out, including a 5-minute attempt.
- A fresh exact install for `@apps-in-toss/web-framework@2.6.0` also timed out at 5 minutes.
- A repeated exact install timed out at 10 minutes and left an npm process running, which was stopped manually.
- The package body partially appeared in ignored `node_modules`, but `package.json` and `package-lock.json` were not updated.
- Phase 82 repeated `npm install @apps-in-toss/web-framework@2.6.0 --save-exact --no-audit --no-fund` and it timed out again after 10 minutes.
- No npm process remained after the timeout. `package.json` and `package-lock.json` stayed unchanged.
- The ignored `node_modules/@apps-in-toss/web-framework` folder still appears partially populated, without a package manifest.

Phase 98 update:

- `npm install @apps-in-toss/web-framework@2.6.0 --save-exact --package-lock-only --ignore-scripts` completed in about 54 seconds.
- `npm install --ignore-scripts --no-audit --no-fund` completed in about 4 minutes.
- `package.json` and `package-lock.json` now lock `@apps-in-toss/web-framework@2.6.0`.
- npm warns that `@apps-in-toss/ait-format@1.0.0` requires Node `>=24` while local validation uses Node `22.22.0`.
- npm reports peer override warnings through React Native compatibility packages.
- npm audit reported 31 vulnerabilities after adding the SDK tree; triage remains required before final submission.

Package metadata notes:

- Tarball: `https://registry.npmjs.org/@apps-in-toss/web-framework/-/web-framework-2.6.0.tgz`
- Unpacked size: about 27.7 MB
- The package pulls several Apps in Toss and Granite dependencies, so a Linux CI, clean package-manager cache, or direct tarball verification path may be a better place to complete installation.

The adapter contract is ready, and the package is now locked. The SDK import/bundle step remains a separate queue.

## Future Queues

- Replace the temporary global bridge hook with the official SDK client in runtime selection.
- Confirm Node 24 compatibility for Apps in Toss packaging paths.
- Triage npm audit output introduced by the SDK dependency tree.
- Add real leaderboard-open result button.
- Add Toss QR test for supported and unsupported app versions, including `getUserKeyForGame()` success/error paths.
