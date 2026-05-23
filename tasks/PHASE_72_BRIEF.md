# Phase 72 Brief - Pause Adjusted Round Clock

## Goal

Keep round duration analytics honest by excluding time spent in the pause state.

## Changes

- Added a small round-clock helper for active duration and pause-span measurement.
- Tracked `paused_ms`, `total_paused_ms`, and active duration around pause/resume events.
- Updated `round_complete.duration_ms` to represent active play time.
- Surfaced pause timing details in the QA analytics panel.

## QA

- Unit tests cover completed pause spans, open pause spans, negative-clock protection, and pause-span measurement.
- Browser coverage checks pause/resume timing fields appear in the QA event panel.
