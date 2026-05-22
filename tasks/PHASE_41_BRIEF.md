# PHASE_41_BRIEF

## Queue

Runtime Toss client selector.

## Goal

Wire the app to a platform-client selection point so an injected Apps in Toss bridge can be used without breaking local browser and CI runs.

## Acceptance Criteria

- Runtime selector uses `globalThis.__TODAY_FRIDGE_TOSS_BRIDGE__` when present.
- Runtime selector falls back to the mock Toss client when no bridge exists.
- UI leaderboard service uses the runtime selector instead of hard-coded mock client creation.
- Unit tests cover injected bridge and fallback paths.

## Commander Notes

This does not replace the official SDK import. It prepares the boundary while package installation remains blocked in this workspace.
