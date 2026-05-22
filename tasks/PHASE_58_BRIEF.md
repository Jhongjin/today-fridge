# Phase 58 Brief

## Queue

Console-ready asset generation harness.

## Commander Intent

Official Apps in Toss console assets should be generated from the current playable build instead of hand-maintained. This keeps logo, thumbnail, and upload-size screenshots reproducible for review packets.

## Changes

- Added `npm run qa:console-assets`.
- Added `scripts/capture-console-assets.mjs`.
- Generates:
  - `logo-600x600.png`
  - `thumbnail-1932x828.png`
  - three vertical `636x1048` screenshots
- Documented the command in screenshot and Toss requirements docs.

## Verification

- Pending asset-generation run plus standard local checks.
