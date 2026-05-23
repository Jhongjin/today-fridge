# PROFILE_GATE

Checked against official Apps in Toss Game Center docs on 2026-05-23.

## Official Requirement

Sources:

- [Game Center intro](https://developers-apps-in-toss.toss.im/game-center/intro.html)
- [Game Center QA](https://developers-apps-in-toss.toss.im/game-center/qa.html)
- [Game Center develop guide](https://developers-apps-in-toss.toss.im/game-center/develop.html)

Apps in Toss Game Center requires a game profile before gameplay. The profile flow does not expose a user identifier through the profile or leaderboard response, so Today Fridge uses the existing game user-key readiness path as the local pre-play gate until real QR evidence confirms the platform profile WebView behavior.

## Runtime States

| State | Meaning | UI rule |
| --- | --- | --- |
| `checking` | The app is resolving the Toss game user-key/profile readiness path. | Board, pause, and hint input stay disabled. |
| `ready` | The game user-key path returned `ready` or local `mock`. | Ranked play can start and `round_start` is emitted. |
| `blocked` | The user-key/profile readiness path returned unavailable. | Board, pause, and hint input stay disabled. |
| `error` | The readiness check failed. | Board, pause, and hint input stay disabled. |

## Analytics

`profile_gate_result` records:

- `status`: `ready`, `blocked`, or `error`
- `user_key_status`: `ready`, `mock`, `unavailable`, or `error`

`round_start` should fire only after the gate reaches `ready`.

## QA Paths

- Normal browser/CI mock path should show the ready gate and allow play.
- `/?qa=toss-bridge` should show ready and allow clean submit/open.
- `/?qa=toss-bridge-no-user-key` should show blocked and keep board, pause, and hint input disabled.
- Real QR candidate builds still need Android/iOS evidence for the native profile creation modal and returning-user welcome behavior.
