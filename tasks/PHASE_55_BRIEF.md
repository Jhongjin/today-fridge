# Phase 55 Brief

## Queue

Reusable Playwright gameplay route helpers.

## Commander Intent

The browser harness now covers several variants of the same daily board route. Keeping those routes in one helper makes later balance, board, and Toss bridge changes safer because expected gameplay paths only need to be updated once.

## Changes

- Added `tests/playwright/helpers/gameplay.ts` with clean-route and failed-route helpers.
- Refactored repeated Playwright click sequences to use the shared helpers.
- Kept Korean copy assertions and result checks in the spec where they describe user-facing behavior.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
