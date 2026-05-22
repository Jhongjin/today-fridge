# PHASE_22_BRIEF

## Queue

Apps in Toss Game Center adapter contract.

## Goal

Create a tested adapter for the official leaderboard submit/open API shape while keeping local and CI builds independent of the Toss WebView runtime.

## Acceptance Criteria

- Adapter accepts an injected Apps in Toss bridge.
- Score submission sends integer scores as strings.
- Minimum Toss app version check is represented.
- Success, unsupported version, unavailable SDK, and non-success statuses map to local result codes.
- Unit tests cover submit and leaderboard-open behavior.
- Installation blocker is documented.

## Commander Notes

The official SDK package import is still pending because local `npm install @apps-in-toss/web-framework` timed out twice.
