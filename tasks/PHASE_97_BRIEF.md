# Phase 97 Brief - SFX Trigger Map

## Summary

- Exported `SOUND_EVENTS` from `src/audio/audioController.ts` so the SFX trigger list is explicit and testable.
- Added unit coverage for the locked sound-event list.
- Added `docs/creative/SFX_TRIGGER_MAP.md` with trigger timing, tone direction, max duration, mix rules, and avoid rules.
- Linked the SFX trigger map from the existing audio event and UX audio docs.
- Updated backlog and decision log.

## Validation

- Targeted unit: `npx vitest run src/audio/audioController.test.ts src/audio/webAudioOutput.test.ts` - 2 files, 7 tests passed.
- `npm test --if-present` - 26 files, 103 tests passed.
- `npm run build --if-present` - passed.
- `npm run check:bundle --if-present` - 208.4 KB / 5120.0 KB budget.
- `npm run test:e2e --if-present` - 48 tests passed across mobile viewports.

## Remaining Risk

- Current SFX are still synthetic Web Audio placeholders.
- Final custom SFX assets should be produced against this map before final Toss submission.
