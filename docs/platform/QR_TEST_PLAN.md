# QR_TEST_PLAN

## Purpose

Define the real Apps in Toss QR-device checks required before commander production approval.

## Devices

Minimum matrix:

- Android Toss app at or above `5.221.0`.
- iOS Toss app at or above `5.221.0`.
- One unsupported or older-version path if available.

## Entry Checks

- QR launches the app without blank screen.
- First playable board appears within 10 seconds.
- Safe-area padding is correct on iOS and Android.
- Back/close behavior returns to Toss without trapping the user.
- No visible text overlap at common device widths.

## Game Flow Checks

- First clean route completes at `1,700` points.
- Hint booster visibly marks the run as outside clean leaderboard eligibility.
- Failed round can claim only the small participation reward.
- Restart increments the attempt count.
- Daily refresh/streak text remains readable.
- Recipe book opens and scrolls.

## Game Center Checks

- Clean completion submits score after user taps submit.
- Duplicate submit for one play ID is blocked or gracefully skipped.
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
- No console/page errors during QR flows.
- Real leaderboard submit/open verified.
- Production monitoring transport decision recorded.
- Commander confirms screenshots and listing copy are still aligned.
