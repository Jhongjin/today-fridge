# Phase 78 Brief - Persistent Player Preferences

## Goal

Reduce repeated setup friction for players who prefer quiet or reduced-motion play.

## Changes

- Added a small player-preferences storage helper.
- Persisted mute and reduced-motion choices in local storage.
- Synced the audio and haptic controllers from persisted state.
- Added stable test ids for the two settings buttons.

## QA

- Unit tests cover preference defaults, combined writes, and malformed storage.
- Browser coverage verifies both toggles remain enabled after reload.
