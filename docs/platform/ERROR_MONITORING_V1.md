# ERROR_MONITORING_V1

## Phase 21 Scope

The app now installs a small client-side error monitor at startup.

Captured events:

- `client_error`
- `unhandled_rejection`
- `asset_load_error`

Current transport:

- Local in-memory analytics queue.
- Optional dedicated HTTP error endpoint via `VITE_ERROR_MONITORING_ENDPOINT`.

## Event Properties

`client_error`:

- `source`
- `message`
- `filename`
- `line_no`
- `column_no`

`unhandled_rejection`:

- `source`
- `message`

`asset_load_error`:

- `source`
- `tag_name`
- `url`

## Guardrails

- No personal data is attached.
- Error messages are captured only as diagnostic strings.
- The monitor is idempotent so React development mode does not double-install handlers.

## Submission Impact

This provides a production transport boundary without binding the game to a vendor SDK. Set `VITE_ERROR_MONITORING_ENDPOINT` for preview or production builds that should send only error-monitoring events to an HTTP collector. Vendor selection, endpoint retention policy, and access ownership still need commander approval before final submission.

## Future Queues

- Add build/version metadata from CI.
- Add a QA-only event inspector.
