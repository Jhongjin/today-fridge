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

External reward QR evidence sessions should be created with:

```bash
npm run qa:qr-session -- --platform android --device "Pixel 8" --toss-version 5.232.0 --mode supported --preview-url <preview-or-qr-url> --commit <sha> --external-rewards
```

Real SDK candidate builds must be created with:

```bash
VITE_TOSS_REAL_CLIENT=true npm run build
```

Keep the flag off for normal browser, CI, and non-QR previews until commander approves real runtime activation.

External reward QR candidates require a second explicit gate:

```bash
VITE_TOSS_REAL_CLIENT=true VITE_TOSS_REAL_EXTERNAL_REWARDS=true npm run qr:external-rewards:build
```

The external reward gate also requires:

- `VITE_TOSS_CONTACTS_VIRAL_MODULE_ID`
- `VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID`
- `VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID`
- `VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID`
- `VITE_TOSS_PROMOTION_CODE`

If any value is missing, `src/platform/externalRewardRuntimeGate.ts` must keep external rewards blocked and report the missing keys.
`src/platform/runtimeExternalRewardClients.ts` must keep mock clients when the gate is `mock` or `blocked`, and only load real SDK adapters when the gate is `real`.

Run the explicit preflight before creating a QR candidate:

```bash
npm run qr:external-rewards:preflight
```

Normal browser, CI, and non-QR builds keep passing when `VITE_TOSS_REAL_EXTERNAL_REWARDS` is not enabled. Any build that sets `VITE_TOSS_REAL_EXTERNAL_REWARDS=true` now fails before Vite starts if the real Toss client flag or any required Toss console ID is missing.

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

## External Reward Checks

- Real external rewards remain off unless both real runtime flags are enabled.
- Runtime external reward clients stay mock when the external reward gate is blocked.
- Contacts viral module ID opens only in QR candidate builds and reports reward, close, no-reward, and error states.
- Full-screen ad IDs load before show, and reward only after `userEarnedReward`.
- Promotion code grants only fixed action rewards and records Toss error codes without affecting ranked score.
- External reward session files capture contacts viral reward/close/error, rewarded-ad completion/failure, and promotion success/error or duplicate-protection evidence.

## Pass Criteria

Final submission approval requires:

- Android and iOS QR checks pass.
- Session evidence files are complete and linked from the commander review notes.
- No console/page errors during QR flows.
- Real leaderboard submit/open verified.
- Production monitoring transport decision recorded.
- Commander confirms screenshots and listing copy are still aligned.
