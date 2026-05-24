# SUBMISSION_READINESS

Checked against official Apps in Toss docs on 2026-05-22.

References:

- [Game launch guide](https://developers-apps-in-toss.toss.im/checklist/app-game.html)
- [Mini app deploy guide](https://developers-apps-in-toss.toss.im/development/deploy.html)
- [Game profile and leaderboard intro](https://developers-apps-in-toss.toss.im/game-center/intro.html)
- [Toss requirements checkpoint](./TOSS_REQUIREMENTS_CHECKPOINT.md)
- [Toss SDK API map](./TOSS_SDK_API_MAP.md)
- [External reward policy](./EXTERNAL_REWARD_POLICY.md)
- [Promotion review requirements](./PROMOTION_REVIEW_REQUIREMENTS.md)
- [SDK dependency triage](./SDK_DEPENDENCY_TRIAGE.md)

## 1. Current Readiness

| Area | Status | Notes |
| --- | --- | --- |
| First playable screen | Partial pass | App loads a playable board locally and in CI. Real Toss QR test pending. |
| CSR/SSG | Pass | Vite static CSR app. |
| Manifest/app icon | Pass | Web manifest references the SVG app icon. |
| Console upload assets | Partial pass | Console logo/thumbnail/screenshot PNGs can be generated locally and dimensions are guarded; final console upload and console setup decision are pending. |
| Bundle size | Pass for prototype | CI checks the static `dist` bundle against a 5 MB default budget and blocks source maps. Must recheck after assets/audio. |
| Sound controls | Partial pass | Mute persists locally, synthetic SFX exist for core gameplay, and pause/resume feedback is wired. Final BGM/custom assets pending. |
| Background sound handling | Partial | SFX playback is suspended on page hide/show lifecycle events. Final BGM lifecycle still needs real-device testing once BGM is added. |
| Safe area | Partial | CSS uses safe-area padding; real iOS Toss WebView test pending. |
| Leaderboard submit timing | Pass by design | Submit action appears after round completion. |
| Game profile | Partial | Real profile WebView is still pending, but clean leaderboard submit is now gated on an available game user key. |
| Game user key | Partial | Adapter maps `getUserKeyForGame()` and records status analytics; real SDK runtime is opt-in and QR validation is pending. |
| Share reward | Mock UI only | Policy-safe mock grant service and integrated QA scenario exist; real `contactsViral` adapter is available behind the external reward gate, with UI wiring pending QR evidence. |
| Rewarded ads | Mock UI only | Policy-safe completion mock and integrated QA scenario exist; real rewarded-ad adapter is available behind the external reward gate, with UI wiring pending QR evidence. |
| Promotion points | Mock UI only | Fixed-action mock and integrated QA scenario exist; real `grantPromotionRewardForGame` adapter is available behind the external reward gate, with UI wiring pending QR evidence and promotion review. |
| Error monitoring | Partial | Local hooks and optional `VITE_ERROR_MONITORING_ENDPOINT` transport exist; production endpoint owner, retention policy, and access controls must be approved or explicitly deferred in the commander review packet. |
| QR test | Pending | Requires Apps in Toss console setup, QR target, and commander packet QR approval. Session evidence harness exists in `docs/platform/QR_SESSION_HARNESS.md`. |

## 2. Submission Blockers

These must be completed before requesting review:

- Real Toss SDK runtime QR validation. The package is locked and wrappers are wired behind explicit runtime flags, but physical Toss QR evidence is still pending.
- Revisit SDK dependency triage for the actual QR/review candidate commit with `npm run sdk:dependency-triage`, then record the SDK dependency decision in the commander review packet.
- Real Game Center profile flow before gameplay.
- Game user key QR validation and persistence strategy.
- Leaderboard submit/open real QR test using Toss APIs.
- Real contacts/ad/promotion UI activation is blocked until external reward QR evidence and commander review are complete.
- QR test on real Toss app.
- QR test plan is documented in `docs/platform/QR_TEST_PLAN.md`.
- QR session evidence protocol is documented in `docs/platform/QR_SESSION_HARNESS.md`.
- QR session evidence can be checked locally with `npm run qa:qr-session:check`.
- QR session evidence can be summarized locally with `npm run qa:qr-session:index`.
- Commander QR review packets can be generated with `npm run qa:commander-review-packet`.
- Commander QR review packets now require completed real-device QR approval or follow-up decision.
- Commander QR review packets now require completed preview deploy approval, skipped-state acceptance, or blocker decision.
- Commander QR review packets now require completed Toss console setup approval or follow-up decision.
- Commander QR review packets now require completed SDK dependency approval or follow-up decision.
- Commander QR review packets now require completed game rating evidence approval before final Toss review.
- Commander QR review packets now require completed production monitoring approval or explicit deferral.
- Sound lifecycle once BGM/custom SFX assets are added.
- Safe Area verification on iOS and Android.
- Production monitoring endpoint owner, retention policy, and access-control approval or explicit deferral recorded in the commander review packet.
- App bundle packaging path and `.ait` upload check recorded in the commander review packet.
- Console-ready PNG logo, thumbnail, screenshot assets, leaderboard setup, and console review state recorded in the commander review packet.
- Game rating classification evidence recorded in the commander review packet.
- Rating evidence checklist is documented in `docs/platform/GAME_RATING_EVIDENCE.md`.

## 3. Policy-Sensitive Items

Do not change without command-center review:

- Toss point rewards must remain unrelated to score, rank, win/loss, or random outcome.
- Clean ranked score must remain no booster, no ad recovery, no share bonus.
- Ads must not appear during active play.
- Share rewards must not improve clean ranked score.
- Leaderboard score submit must happen after round end.
- Promotion points must pass console review, test-code call, budget review, duplicate prevention, and QR/device verification before UI exposure.

## 4. GitHub/Vercel Setup

Preview auto-deploy is wired but currently skipped until secrets are configured. Use `npm run deploy:check-prereqs` and `docs/platform/VERCEL_PREVIEW_SETUP.md`, then record the preview deploy decision in the commander review packet.

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
