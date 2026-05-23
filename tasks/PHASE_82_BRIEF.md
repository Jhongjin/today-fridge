# Phase 82 Brief - Toss SDK Recheck

## Goal

Reconfirm the official Apps in Toss SDK path before moving into real Game Center and QR queues.

## Findings

- Official Game Center docs still require game score submission after play completion.
- `submitGameCenterLeaderBoardScore` accepts a numeric score string and can return `undefined` on unsupported Toss versions.
- `openGameCenterLeaderboard` is independent from score submission.
- Both Game Center APIs require Toss app `5.221.0+`.
- Game profile creation must happen before score submission, and user identification is handled by the SDK.
- npm metadata reports `@apps-in-toss/web-framework@2.6.0` as latest.

## Install Attempt

Command:

```powershell
npm install @apps-in-toss/web-framework@2.6.0 --save-exact --no-audit --no-fund
```

Result:

- Timed out after 10 minutes in the local Windows workspace.
- `package.json` and `package-lock.json` were not changed.
- No npm process remained after the timeout.
- An ignored partial package folder exists under `node_modules/@apps-in-toss/web-framework`, but it lacks `package.json`.

## Decision

Keep the injected adapter boundary. Do not import the official package until installation can complete in a clean environment.

## Next Queue

Move to Game Center/profile/user-key planning while preserving the runtime mock bridge for browser and CI stability.
