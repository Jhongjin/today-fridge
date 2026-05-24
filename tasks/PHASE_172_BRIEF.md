# Phase 172 Brief - Summary Evidence Docs

## Why

Phases 165-171 expanded GitHub summary evidence across Queue Preview and local QA helpers. The higher-level QA and deployment docs should describe the current evidence surface in one place.

## Changed

- Updated `docs/platform/TOSS_QA_HARNESS.md` with current summary-capable QR, packet, and screenshot evidence helpers.
- Updated `docs/platform/DEPLOYMENT_PIPELINE.md` so Queue Preview validation includes SDK dependency triage and external reward prerequisites.
- Updated backlog and decision log.

## Validation

- `git diff --check`
- `npm run qa:korean-copy --if-present`

## Notes

- Docs-only update. No runtime behavior changed.
