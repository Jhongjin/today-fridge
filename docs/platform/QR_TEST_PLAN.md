# QR_TEST_PLAN

## Purpose

Define the real Apps in Toss QR-device checks required before commander production approval.

## Devices

Minimum matrix:

- Android Toss app at or above `5.232.0`.
- iOS Toss app at or above `5.232.0`.
- One unsupported or older-version path if available.

Version meaning:

- `5.221.0` is the Game Center leaderboard submit/open minimum.
- `5.232.0` is the game user key minimum.

## Session Evidence

Create one session file per physical device run:

```bash
npm run qa:qr-session -- --platform android --device "Pixel 8" --toss-version 5.232.0 --mode supported --preview-url <preview-or-qr-url> --commit <sha>
```

See `docs/platform/QR_SESSION_HARNESS.md`.

Required artifacts:

- Filled session Markdown file under `qa/qr-sessions/`.
- Entry screenshot.
- Result screenshot.
- Leaderboard screenshot when Game Center is available.
- Error screenshot or notes for unsupported/error paths.
- Screen recording if a defect is timing or navigation related.

Real SDK candidate builds must be created with:

```bash
VITE_TOSS_REAL_CLIENT=true npm run build
```

Keep the flag off for normal browser, CI, and non-QR previews until commander approves real runtime activation.

## Entry Checks

- QR launches the app without blank screen.
- First playable board appears within 10 seconds.
- Safe-area padding is correct on iOS and Android.
- Back/close behavior returns to Toss without trapping the user.
- No visible text overlap at common device widths.

## Game Flow Checks

- Profile gate blocks board input until profile/user-key readiness is confirmed.
- First clean route completes at `1,700` points.
- Hint booster visibly marks the run as outside clean leaderboard eligibility.
- Failed round can claim only the small participation reward.
- Restart increments the attempt count.
- Daily refresh/streak text remains readable.
- Recipe book opens and scrolls.

## Game Center Checks

- `game_user_key_result` records `result:ready` on supported devices.
- `profile_gate_result` records `status:ready` before the first `round_start`.
- Unsupported user-key path keeps the first playable flow available and records `unavailable` or `error`.
- Clean leaderboard submit is skipped with `GAME_USER_KEY_UNAVAILABLE` if the game user key is unavailable.
- Clean completion submits score after user taps submit.
- Duplicate submit for one play ID is blocked or gracefully skipped.
- Failed SDK submit paths resolve to a known typed error code, with unknown status codes recorded as `TOSS_LEADERBOARD_SUBMIT_FAILED`.
- Booster-assisted completion does not submit a clean score.
- Leaderboard opens only after user taps the leaderboard action.
- Unsupported Toss version shows an error/skip path, not a stuck state.

## Observability Checks

- `app_open`, `first_playable_ready`, and `round_start` are recorded.
- `round_complete`, `leaderboard_submit`, and `leaderboard_open` are recorded.
- Client errors and asset-load failures are captured.
- QA analytics panel can be used only with `?qa=analytics`.

## Pass Criteria

Final submission approval requires:

- Android and iOS QR checks pass.
- Session evidence files are complete and linked from the commander review notes.
- No console/page errors during QR flows.
- Real leaderboard submit/open verified.
- Production monitoring transport decision recorded.
- Commander confirms screenshots and listing copy are still aligned.
