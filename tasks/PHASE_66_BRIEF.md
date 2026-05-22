# Phase 66 Brief

## Queue

Leaderboard submit failure copy split.

## Commander Intent

A platform/network submit failure and a fairness skip are different problems. Players should see retry guidance for temporary submit failures, while booster-assisted runs should still explain clean-ranked eligibility.

## Changes

- Split result submit note copy by `skipped` versus `error`.
- Expanded the QA Toss bridge failure browser test to retry after failure.
- Documented the copy expectation in the QA harness.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
