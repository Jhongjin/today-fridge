# ERROR_MONITORING_V1

## Phase 21 Scope

The app now installs a small client-side error monitor at startup.

Captured events:

- `client_error`
- `unhandled_rejection`
- `asset_load_error`

Current transport:

- Local in-memory analytics queue.

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

This does not replace production monitoring. It prepares the event contract and makes QR/device testing easier before a vendor such as Sentry is configured.

## Future Queues

- Add production error transport.
- Add build/version metadata from CI.
- Add a QA-only event inspector.
