# Phase 63 Brief

## Queue

Optional HTTP analytics transport.

## Commander Intent

Production monitoring should be switchable without choosing a heavyweight vendor yet. A plain HTTP endpoint gives the commander a low-commitment path for preview and QR-device telemetry.

## Changes

- Added `createHttpAnalyticsTransport`.
- Added `installHttpAnalyticsTransport`.
- Wired `VITE_ANALYTICS_ENDPOINT` during app boot.
- Added Vite env typing and unit coverage.
- Documented the optional deployment variable.

## Verification

- Pending local unit, production build, bundle guard, and Playwright checks.
