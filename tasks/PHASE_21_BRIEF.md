# PHASE_21_BRIEF

## Queue

Client error monitoring hooks.

## Goal

Capture runtime browser errors in the local analytics event harness before production monitoring is selected.

## Acceptance Criteria

- Startup installs error and unhandled rejection listeners.
- `client_error` and `unhandled_rejection` events use the analytics envelope.
- Installation is idempotent.
- Unit tests cover explicit and browser-dispatched errors.
- Submission readiness is updated from pending to partial.

## Commander Notes

This is a QA/debug contract, not final production observability.
