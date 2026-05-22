# Phase 56 Brief

## Queue

Clean stale submission screenshot artifacts before capture.

## Commander Intent

Submission screenshots should represent the current build only. The capture harness should remove stale PNGs before writing the known six-image review set so QA and review packaging do not accidentally include old states.

## Changes

- `qa:screenshots` now deletes `qa/artifacts/submission-screenshots` before recreating it.
- The rest of the capture sequence remains unchanged.
- Recorded the queue in the backlog and decision log.

## Verification

- Pending screenshot harness run plus standard build and browser checks.
