# PHASE_47_BRIEF

## Queue

Production source map guard.

## Goal

Prevent accidental source map files from being included in production build artifacts.

## Acceptance Criteria

- Bundle budget script scans `dist` files.
- Script fails when `.map` files are present.
- Deployment documentation mentions the source map guard.
- Existing build and bundle checks still pass.

## Commander Notes

This keeps submission artifacts lean and avoids accidental code disclosure while the app is still moving quickly.
