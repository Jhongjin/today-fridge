# AUDIO_EVENT_MAP

## 1. Purpose

This document locks the sound-event contract before real BGM/SFX assets are added.

The current implementation records sound events through `src/audio/audioController.ts`. It does not yet play real audio. This keeps gameplay, settings, and tests stable while creative audio assets are still pending.

## 2. Sound Events

| Event | Future Sound Direction |
| --- | --- |
| `fridge_open` | Soft fridge door open |
| `ingredient_select` | Light tap |
| `match_clear` | Clean container click or pop |
| `recipe_complete` | Warm 2-3 second dish jingle |
| `expiring_rescue` | Fresh sparkle, not an alarm |
| `booster_use` | Soft helper tap, clearly less exciting than a clear |
| `round_complete` | Gentle completion flourish |
| `round_fail` | Low soft notice |
| `leaderboard_submit` | Short confirmation chime |

## 3. Rules

- Mute must suppress all SFX.
- BGM and SFX should eventually have separate controls.
- No sharp alarms for expiring ingredients.
- No casino-like reward sounds.
- No audio-only critical feedback.
- Sounds should remain short and low-fatigue.

## 4. Implementation Status

Current:

- Sound event controller exists.
- Mute suppresses sound events.
- Gameplay calls sound events on select, clear, rescue, completion, failure, and leaderboard submit.

Pending:

- Actual audio asset loading.
- Separate BGM/SFX volume.
- Background pause/resume.
- Haptic feedback mapping.
