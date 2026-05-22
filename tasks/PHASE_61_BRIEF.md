# Phase 61 Brief

## Queue

Audio lifecycle suspension.

## Commander Intent

Apps in Toss review guidance calls out sound handling during background transitions. The MVP uses lightweight SFX rather than final BGM, but the audio controller should already respect page visibility and navigation lifecycle events.

## Changes

- Added suspended state to the audio controller.
- Suppresses SFX while suspended, independent of mute state.
- Connected `visibilitychange`, `pagehide`, and `pageshow` in the app.
- Added unit coverage and docs updates.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
