# Phase 70 Brief

## Queue

Console asset dimension guard.

## Commander Intent

Apps in Toss console assets have exact upload dimensions. The generation script should fail fast if viewport, layout, or screenshot settings drift away from those dimensions.

## Changes

- Added PNG IHDR dimension verification to `qa:console-assets`.
- The script now checks logo, thumbnail, and three vertical screenshots after capture.
- Documented the guard in submission screenshot docs.

## Verification

- Pending console asset generation plus standard local checks.
