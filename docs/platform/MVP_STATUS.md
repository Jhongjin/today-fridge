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
- External reward policy guard exists for future share, ad, and promotion integrations.
- External reward QA scenarios now verify share, rewarded-ad, and promotion mock rewards together without clean ranked score impact.
- Toss Game Center boundary now includes leaderboard submit/open plus game user key status mapping through the injected bridge.
- Official Apps in Toss SDK wrappers are available behind explicit QR-candidate runtime flags.
- Real contacts viral, rewarded-ad, and promotion adapters are available behind a separate external reward gate.
- Clean leaderboard submission is now blocked when the game user key is unavailable.
- QA harness exists for analytics, Toss bridge smoke path, first-viewport/full-flow screenshots, console/page errors, SDK dependency triage, bundle size, source maps, QR evidence, commander review packets, and Queue Preview evidence summaries.
- Quiet/reduced-motion settings persist locally and emit QA-visible settings analytics.

## Verified Locally

- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`
- `npm run qa:screenshots`
- `npm run qa:console-assets`
- `npm run qa:korean-copy`
- `npm run external-rewards:check-prereqs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <queue-preview-run-url> --preview-url <https-preview-or-qr-url> --session-index <qr-index-evidence>`
- Queue Preview summary evidence for SDK dependency triage, QA helper surface, Korean copy, external reward prerequisites, bundle budget, console assets, submission screenshots, and deploy prerequisites.

## Current Submission Blockers

- Official `@apps-in-toss/web-framework@2.6.0` is locked and SDK wrappers are wired behind explicit QR-candidate flags, but real Toss QR validation is still pending.
- SDK dependency tree raises Node 24 engine and npm audit warnings; current triage is documented in `docs/platform/SDK_DEPENDENCY_TRIAGE.md`, and commander packets now require an explicit SDK dependency decision.
- Real Apps in Toss QR test and commander packet QR approval are still pending; see `docs/platform/QR_TEST_PLAN.md`.
- Commander packet metadata now requires reviewed commit matching, Queue Preview run URL, HTTPS preview/QR target, and QR session index evidence before final approval.
- Real Game Center profile and user-key QR validation are still pending.
- Real leaderboard submit/open needs QR-device verification.
- Real contacts/ad/promotion UI wiring remains gated until QR evidence and commander review are complete.
- Console-ready PNG logo, thumbnail, and screenshot dimensions are locally generated and guarded; final console upload and console setup approval are still pending.
- Game rating evidence has generator/checker tooling and a commander packet gate, but the selected store self-rating or GRAC certificate evidence is still pending.
- Preview deploy can still be skipped when GitHub/Vercel prerequisites are missing; commander packets now require an explicit preview deploy approval, skipped-state acceptance, or blocker decision.
- BGM/custom audio assets are not final, but synthetic SFX and pause/resume feedback are in place.
- iOS/Android safe-area and background audio lifecycle need device checks.
- Production monitoring vendor is not selected, but optional HTTP analytics and error-only transports can be enabled with `VITE_ANALYTICS_ENDPOINT` and `VITE_ERROR_MONITORING_ENDPOINT`; commander packets now require an explicit monitoring approval or deferral decision.

## Commander Position

The playable MVP is strong enough for internal and preview review. It is not ready for final Toss submission until real QR/device checks, console setup, rating evidence, and commander review packets are cleared.
