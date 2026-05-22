# LEADERBOARD_OPEN_V1

## Phase 23 Scope

The result screen now exposes a `랭킹 보기` action.

Current behavior:

- Calls `leaderboardService.open("result_panel")`.
- Tracks `leaderboard_open`.
- Uses the mock Toss client locally.
- Can later route to `openGameCenterLeaderboard()` through `createAppsInTossClient`.

## UX Rule

Opening the leaderboard is separate from score submission.

This matches the official Apps in Toss Game Center docs: submitting a score does not automatically open the leaderboard, and opening the leaderboard can be called independently.

## Events

`leaderboard_open`:

- `source`
- `status`
- `error_code`

## Future Queues

- Wire production leaderboard open to the official SDK package.
- Add QR-device validation.
- Add unsupported-version copy once real Toss runtime is available.
