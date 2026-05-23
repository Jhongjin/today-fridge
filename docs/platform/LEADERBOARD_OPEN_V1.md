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

- Wire production leaderboard open to the official SDK package. (Phase 99 wrapper and Phase 101 opt-in done)
- Add QR-device validation.
- Add unsupported-version copy once real Toss runtime is available.

## Phase 103 Lock

- Browser QA now asserts that no submit/open bridge events fire before the user taps result actions.
- After one clean submit, the submit button is disabled and the bridge receives exactly one submit event.
- Opening the leaderboard remains a separate user action and records exactly one open event.
