# PHASE_46_BRIEF

## Queue

Split large UI helper panels out of App.

## Goal

Keep the main app component focused on game state and flow by extracting secondary panels into dedicated UI components.

## Acceptance Criteria

- Analytics QA panel lives in its own TSX module.
- Recipe book panel lives in its own TSX module.
- App imports the focused panels and keeps existing behavior.
- React component checklist is reviewed after the split.
- Unit, build, bundle, and browser checks still pass.

## Commander Notes

This is a maintenance queue to make upcoming feature work less brittle.
