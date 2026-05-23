# SUBMISSION_READINESS

Checked against official Apps in Toss docs on 2026-05-22.

References:

- [Game launch guide](https://developers-apps-in-toss.toss.im/checklist/app-game.html)
- [Mini app deploy guide](https://developers-apps-in-toss.toss.im/development/deploy.html)
- [Game profile and leaderboard intro](https://developers-apps-in-toss.toss.im/game-center/intro.html)
- [Toss requirements checkpoint](./TOSS_REQUIREMENTS_CHECKPOINT.md)

## 1. Current Readiness

| Area | Status | Notes |
| --- | --- | --- |
| First playable screen | Partial pass | App loads a playable board locally and in CI. Real Toss QR test pending. |
| CSR/SSG | Pass | Vite static CSR app. |
| Manifest/app icon | Pass | Web manifest references the SVG app icon. |
| Console upload assets | Partial pass | Console logo/thumbnail/screenshot PNGs can be generated locally and dimensions are guarded; final console upload pending. |
| Bundle size | Pass for prototype | CI checks the static `dist` bundle against a 5 MB default budget and blocks source maps. Must recheck after assets/audio. |
| Sound controls | Partial pass | Mute persists locally, synthetic SFX exist for core gameplay, and pause/resume feedback is wired. Final BGM/custom assets pending. |
| Background sound handling | Partial | SFX playback is suspended on page hide/show lifecycle events. Final BGM lifecycle still needs real-device testing once BGM is added. |
| Safe area | Partial | CSS uses safe-area padding; real iOS Toss WebView test pending. |
| Leaderboard submit timing | Pass by design | Submit action appears after round completion. |
| Game profile | Pending | Official docs say profile registration is required before gameplay. |
| Game user key | Partial | Adapter now maps `getUserKeyForGame()` and records status analytics; real SDK package import and QR validation pending. |
| Share reward | Pending | Not implemented. |
| Rewarded ads | Pending | Not implemented. |
| Promotion points | Pending | Policy documented only. |
| Error monitoring | Partial | Local `client_error` and `unhandled_rejection` analytics hooks exist; production transport still pending. |
| QR test | Pending | Requires Apps in Toss console setup. |

## 2. Submission Blockers

These must be completed before requesting review:

- Real Toss SDK package import and runtime wiring. Adapter contract exists in `src/platform/appsInTossClient.ts`, but local exact install still times out.
- Game profile flow before gameplay.
- Game user key QR validation and persistence strategy.
- Leaderboard submit/open real QR test using Toss APIs.
- QR test on real Toss app.
- QR test plan is documented in `docs/platform/QR_TEST_PLAN.md`.
- Sound lifecycle once BGM/custom SFX assets are added.
- Safe Area verification on iOS and Android.
- Error monitoring.
- App bundle packaging path and `.ait` upload check.
- Console-ready PNG logo, thumbnail, and screenshot assets.
- Game rating classification evidence.
- Rating evidence checklist is documented in `docs/platform/GAME_RATING_EVIDENCE.md`.

## 3. Policy-Sensitive Items

Do not change without command-center review:

- Toss point rewards must remain unrelated to score, rank, win/loss, or random outcome.
- Clean ranked score must remain no booster, no ad recovery, no share bonus.
- Ads must not appear during active play.
- Share rewards must not improve clean ranked score.
- Leaderboard score submit must happen after round end.

## 4. GitHub/Vercel Setup

Preview auto-deploy is ready but disabled until secrets are configured.

Required GitHub repository variable:

- `AUTO_DEPLOY_ENABLED=true`

Required GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Production deploy remains manual through `Commander Production Deploy`.

## 5. Real Device QA Checklist

- Open through Apps in Toss QR test.
- Verify first playable screen within 10 seconds.
- Verify profile creation and returning user flow.
- Verify leaderboard submit after completed round.
- Verify leaderboard open from result screen.
- Verify close/back behavior.
- Verify sound mute and background pause/resume.
- Verify no text overlap on common Android/iOS devices.
- Verify network failures do not trap the player.
- Verify error logging captures client failures.
