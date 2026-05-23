# AUDIO_EVENT_MAP

## 1. Purpose

This document locks the sound-event contract before custom BGM/SFX assets are added.

The current implementation records sound events through `src/audio/audioController.ts` and uses a lightweight Web Audio output adapter when the browser supports it. This keeps gameplay, settings, and tests stable while custom creative audio assets are still pending.

The controller is lifecycle-aware: the app suspends SFX while the page is hidden or unloading, then allows playback again when the page is visible.

## 2. Sound Events

| Event | Future Sound Direction |
| --- | --- |
| `fridge_open` | Soft fridge door open |
| `ingredient_select` | Light tap |
| `match_clear` | Clean container click or pop |
| `recipe_complete` | Warm 2-3 second dish jingle |
| `expiring_rescue` | Fresh sparkle, not an alarm |
| `booster_use` | Soft helper tap, clearly less exciting than a clear |
| `game_pause` | Very short low pause tick |
| `game_resume` | Very short warm resume tick |
| `round_complete` | Gentle completion flourish |
| `round_fail` | Low soft notice |
| `leaderboard_submit` | Short confirmation chime |
| `result_share` | Light social confirmation tick |

## 3. Rules

- Mute must suppress all SFX.
- BGM and SFX should eventually have separate controls.
- No sharp alarms for expiring ingredients.
- No casino-like reward sounds.
- No audio-only critical feedback.
- Sounds should remain short and low-fatigue.
- Haptics must be short, optional, and suppressed when reduced motion is enabled.

## 4. Implementation Status

Current:

- Sound event controller exists.
- Mute suppresses sound events.
- Web Audio output plays short synthetic SFX when supported.
- Gameplay calls sound events on select, clear, rescue, pause, resume, completion, failure, result share, and leaderboard submit.
- Haptic controller maps the same core gameplay confirmations to short vibration patterns when supported.

Pending:

- Custom audio asset loading.
- Separate BGM/SFX volume.
- Background pause/resume.
