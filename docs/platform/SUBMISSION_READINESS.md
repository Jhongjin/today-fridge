# SUBMISSION_READINESS

Checked against official Apps in Toss docs on 2026-05-22.

References:

- [Game launch guide](https://developers-apps-in-toss.toss.im/checklist/app-game.html)
- [Mini app deploy guide](https://developers-apps-in-toss.toss.im/development/deploy.html)
- [Game profile and leaderboard intro](https://developers-apps-in-toss.toss.im/game-center/intro.html)

## 1. Current Readiness

| Area | Status | Notes |
| --- | --- | --- |
| First playable screen | Partial pass | App loads a playable board locally and in CI. Real Toss QR test pending. |
| CSR/SSG | Pass | Vite static CSR app. |
| Bundle size | Pass for prototype | Current build JS/CSS is far below 100MB. Must recheck after assets/audio. |
| Sound controls | Placeholder | Mute toggle exists. Actual BGM/SFX engine not implemented yet. |
| Background sound handling | Pending | Needs real audio lifecycle once audio exists. |
| Safe area | Partial | CSS uses safe-area padding; real iOS Toss WebView test pending. |
| Leaderboard submit timing | Pass by design | Submit action appears after round completion. |
| Game profile | Pending | Official docs say profile registration is required before gameplay. |
| Game user key | Pending | Mock only. Real Toss SDK adapter needed. |
| Share reward | Pending | Not implemented. |
| Rewarded ads | Pending | Not implemented. |
| Promotion points | Pending | Policy documented only. |
| Error monitoring | Pending | Sentry or equivalent not configured. |
| QR test | Pending | Requires Apps in Toss console setup. |

## 2. Submission Blockers

These must be completed before requesting review:

- Real Toss SDK adapter.
- Game profile flow before gameplay.
- Game user key flow and persistence strategy.
- Leaderboard submit/open using Toss APIs.
- QR test on real Toss app.
- Sound lifecycle once BGM/SFX are added.
- Safe Area verification on iOS and Android.
- Error monitoring.
- App bundle packaging path and `.ait` upload check.

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

