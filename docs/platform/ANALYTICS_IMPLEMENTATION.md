# ANALYTICS_IMPLEMENTATION

## Phase 12 Scope

The MVP client now has a lightweight analytics harness that mirrors the schema in `ANALYTICS_SCHEMA.md` without binding the prototype to a vendor SDK.

Every tracked event includes:

- `event_name`
- `event_time`
- `app_version`
- `platform`
- `entry_source`
- `session_id`
- `user_key_status`
- `properties`

`eventName` is also kept as a camelCase alias for current unit tests and developer ergonomics.

## Current Event Flow

First screen:

- `app_open`
- `first_playable_ready`
- `round_start`
- `game_user_key_result`

Gameplay:

- `move_commit`
- `match_clear`
- `recipe_complete`
- `expiring_rescue`
- `round_complete`
- `round_fail`
- `mission_summary`

Competition:

- `leaderboard_submit`
- `leaderboard_open`
- `result_share`

Rewards:

- `daily_reward_claim`
- `coin_award`
- `recipe_piece_award`

Debug:

- `client_error`
- `unhandled_rejection`
- `asset_load_error`

## QA Inspector

Open the app with `?qa=analytics` or `?analytics_debug` to show a local event inspector. Round-complete events show score tier, and leaderboard submit events show score-audit fields directly so QR testers can confirm the board seed, selected route, and score receipt.

The panel is only a client-side QA aid. It reads the same in-memory event buffer used by tests and updates as new events are tracked.

## Transport Boundary

`src/platform/analytics.ts` exposes `setAnalyticsTransport`. A production transport can be injected later without changing gameplay code. Transport failures are swallowed so analytics outages never block play, reward claims, or leaderboard actions.

`src/platform/httpAnalyticsTransport.ts` provides the first concrete transport. Set `VITE_ANALYTICS_ENDPOINT` at build time to send events with `navigator.sendBeacon` and fall back to `fetch` with `keepalive`.

## Retention Questions Covered

This harness can already answer:

- Did the player reach a playable first screen?
- Did the player start the first round?
- Which moves were committed before completion or failure?
- Did the player complete the recipe and rescue targets?
- Which result missions were completed or missed?
- Did the player submit a clean ranked score?
- Did the player tap result sharing after completion?
- Did replay attempts start after restart?
- Did the player claim the fixed completion reward?
- Did the client capture runtime errors during QA?

## Guardrails

- No personal data is collected in the client harness.
- The Toss game user key hash is not stored or sent by the local client harness; only `user_key_status` and the `game_user_key_result` status are tracked.
- Startup updates `user_key_status` after the async platform `getUserKey()` check, so events before the result may still show the initial mock/browser status.
- Ranked fairness flags stay with leaderboard submission events.
- The event store remains local and in-memory by default.
- A production transport can be injected through `setAnalyticsTransport`.

## Future Queues

- Add batching and retry policy if the selected endpoint requires it.
- Add sampled `client_error` and `asset_load_error` capture.
- Add product dashboard queries for replay rate, completion rate, and leaderboard submit rate.
