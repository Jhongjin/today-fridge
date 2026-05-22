# PHASE_42_BRIEF

## Queue

QA Toss bridge browser smoke path.

## Goal

Exercise the Apps in Toss injected bridge path in browser automation even before the official SDK package can be bundled.

## Acceptance Criteria

- `?qa=toss-bridge` installs a fake bridge only when no real bridge exists.
- QA bridge records submit/open calls for assertions.
- Main app installs the QA bridge before React renders.
- Unit tests cover QA bridge install, no-op, and no-overwrite behavior.
- Mobile browser tests complete a round through the QA bridge submit/open path.

## Commander Notes

This keeps the real platform path testable while preserving local and CI stability.
