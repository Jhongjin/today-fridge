# MVP_STATUS

## Current MVP Strength

- First playable mobile board is implemented and covered by browser tests.
- Core loop is clear: select ingredients, clear matches, complete the recipe, rescue expiring items.
- Replay loop exists through personal best, best route memory, attempt count, and result missions.
- Retention loop exists through daily 05:00 KST seed, local streak, fixed rewards, recipe pieces, and recipe book.
- Competition loop exists through clean leaderboard submit/open boundaries and shareable result flow.
- Replay competition has been strengthened with live personal-best chase copy and best-route preview/state.
- Play controls now include real pause/resume behavior with pause-adjusted round duration.
- Fairness guard exists: hint booster runs cannot update clean personal best or submit clean leaderboard score.
- QA harness exists for analytics, Toss bridge smoke path, screenshots, console/page errors, bundle size, and source maps.
- Quiet/reduced-motion settings persist locally and emit QA-visible settings analytics.

## Verified Locally

- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`
- `npm run qa:screenshots`
- `npm run qa:console-assets`

## Current Submission Blockers

- Official `@apps-in-toss/web-framework` package install still times out in the local Windows workspace.
- Real Apps in Toss QR test is still pending; see `docs/platform/QR_TEST_PLAN.md`.
- Real Game Center profile/user-key flow is still pending.
- Real leaderboard submit/open needs QR-device verification.
- Console-ready PNG logo, thumbnail, and screenshot dimensions are locally generated and guarded; final console upload is still pending.
- BGM/custom audio assets are not final, but synthetic SFX and pause/resume feedback are in place.
- iOS/Android safe-area and background audio lifecycle need device checks.
- Production monitoring vendor is not selected, but an optional HTTP analytics transport can be enabled with `VITE_ANALYTICS_ENDPOINT`.

## Commander Position

The playable MVP is strong enough for internal and preview review. It is not ready for final Toss submission until the real SDK/QR path and device checks are cleared.
