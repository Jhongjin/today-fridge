# PHASE_31_BRIEF

## Queue

Asset load error analytics.

## Goal

Capture missing image, script, link, audio, and video resource failures during QA.

## Acceptance Criteria

- Error monitor captures `asset_load_error` in capture phase.
- JavaScript runtime errors are not duplicated as asset errors.
- Unit tests cover an image load failure.
- Error monitoring docs list the new event properties.

## Commander Notes

This is still local analytics transport. It prepares the production monitoring event contract.
