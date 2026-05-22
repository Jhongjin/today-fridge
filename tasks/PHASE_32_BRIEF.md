# PHASE_32_BRIEF

## Queue

Playwright-wide console and page error guard.

## Goal

Fail mobile browser tests on console errors or uncaught page errors across every interaction path.

## Acceptance Criteria

- Console error collection runs before every Playwright test.
- Page runtime errors are collected before every Playwright test.
- After each test, collected issues must be empty.
- Existing mobile flows still pass.

## Commander Notes

This catches errors from interactions after first paint, including audio, reward, and result-screen flows.
