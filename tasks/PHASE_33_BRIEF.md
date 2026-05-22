# PHASE_33_BRIEF

## Queue

QA-only analytics event inspector.

## Goal

Make QR, device, and Toss WebView checks easier by exposing recent local analytics events without connecting a production transport.

## Acceptance Criteria

- `?qa=analytics` displays a QA event panel.
- The panel subscribes to live tracked events.
- The panel stays hidden for normal players.
- Unit tests cover the analytics subscription API.
- Mobile browser tests verify live event updates.

## Commander Notes

This keeps the measurement loop visible during submission QA while preserving the current no-personal-data, local-only analytics stance.
