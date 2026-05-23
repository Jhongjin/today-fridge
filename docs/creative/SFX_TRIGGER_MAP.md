# SFX_TRIGGER_MAP

## Purpose

The SFX layer should make taps, clears, rescue, pause, and results feel responsive without adding pressure. Sounds are confirmations, not instructions, rewards, or casino-like excitement.

## Trigger List

| Event | Trigger | Direction | Max duration |
| --- | --- | --- | ---: |
| `fridge_open` | First playable fridge appears or a future fridge-open transition starts. | Soft fridge door, low and warm. | 0.25s |
| `ingredient_select` | Player taps a valid ingredient cell. | Light ceramic or container tap. | 0.08s |
| `match_clear` | Three identical ingredients clear. | Clean pop or tidy container click. | 0.15s |
| `recipe_complete` | Main or future side recipe completes. | Warm kitchen flourish, not a jackpot. | 0.60s |
| `expiring_rescue` | Expiring ingredient is cleared. | Fresh sparkle, never an alarm. | 0.18s |
| `booster_use` | Hint or future comfort booster is used. | Soft helper tap, quieter than a clear. | 0.12s |
| `game_pause` | Player pauses. | Low short tick. | 0.10s |
| `game_resume` | Player resumes. | Slightly higher warm tick. | 0.10s |
| `round_complete` | Round ends complete. | Gentle completion flourish. | 0.70s |
| `round_fail` | Round fails. | Low soft notice, no buzzer. | 0.25s |
| `leaderboard_submit` | Clean score submit succeeds. | Short confirmation chime. | 0.20s |
| `result_share` | Result share succeeds. | Light social confirmation tick. | 0.16s |

The implementation list is exported as `SOUND_EVENTS` from `src/audio/audioController.ts`.

## Mix Rules

- Quiet mode suppresses all SFX.
- Page hidden/unload state suspends all SFX.
- Reduced motion does not mute SFX, but haptics are disabled when reduced motion is on.
- SFX should sit above BGM, but never exceed the comfort of the tap sound by more than one clear perceived step.
- Repeated tap sounds must remain low enough for rapid play.

## Avoid

- Countdown tension.
- Slot-machine, gacha, roulette, or jackpot sounds.
- Sharp alarms for expiring ingredients.
- Childish toy squeaks.
- Long failure stingers.
- Audio-only critical feedback.
