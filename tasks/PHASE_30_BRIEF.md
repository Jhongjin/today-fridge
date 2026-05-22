# PHASE_30_BRIEF

## Queue

Lightweight Web Audio SFX output.

## Goal

Move from sound-event recording only to short browser-played SFX while preserving mute behavior and testability.

## Acceptance Criteria

- Audio controller forwards unmuted events to an output adapter.
- Muted audio suppresses history and output.
- Web Audio output is safe when unsupported.
- App wires the Web Audio output into the controller.
- Unit tests cover output forwarding and no-op safety.

## Commander Notes

This is not final sound design. It is a low-fatigue placeholder until custom assets and BGM lifecycle are ready.
