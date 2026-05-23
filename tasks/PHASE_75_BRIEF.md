# Phase 75 Brief - Replay Route State

## Goal

Make the saved route preview respond to the player's replay choices without turning it into a mandatory hint system.

## Changes

- Added best-route progress detection against the current route prefix.
- Updated the route strip copy for ready, following, and new-route states.
- Added a softer off-route visual state for experimentation.
- Updated competition-loop documentation.

## QA

- Browser coverage verifies the route strip switches to the new-route state when the replay diverges from the saved best path.
