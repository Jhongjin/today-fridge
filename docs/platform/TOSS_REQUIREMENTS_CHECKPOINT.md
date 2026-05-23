# TOSS_REQUIREMENTS_CHECKPOINT

Official Apps in Toss docs rechecked on 2026-05-23.

## Sources

- [Apps in Toss landing/FAQ](https://toss.im/apps-in-toss)
- [Mini app deploy guide](https://developers-apps-in-toss.toss.im/development/deploy.md)
- [Game launch guide](https://developers-apps-in-toss.toss.im/checklist/app-game.md)
- [Game Center development guide](https://developers-apps-in-toss.toss.im/game-center/develop.md)
- [Developer docs LLM bundle](https://developers-apps-in-toss.toss.im/llms-full.txt)

## Locked Requirements

| Area | Official Requirement | Today Fridge Position |
| --- | --- | --- |
| Game eligibility | Apps in Toss allows games, but restricts categories such as gambling-like, financial product brokerage/sales, digital asset trading, and other policy-sensitive services. | Keep the game a low-stakes casual puzzle. No random cash reward, betting, or score-linked Toss point reward. |
| Game rating | Game mini apps require rating classification evidence through GRAC or an eligible app store/open market. | Blocker. Rating evidence must be prepared before final submission. |
| Review request | Review is requested through the Apps in Toss console after testing. Review can take up to 3 business days, and only one version can be under review at a time. | Commander final approval remains required before review request. |
| Test gate | The review button is enabled only after at least one test is completed. | Blocker. QR/device test must be completed in Toss before review. |
| Bundle size | Uploaded app bundle must be 100 MB or less after extraction. | Current `dist` is about 199 KB and CI budget is 5 MB, so prototype is well under the platform cap. |
| Production launch | Once approved, pressing launch immediately exposes the app to users. | Keep production deploy manual. Preview/CI automation is acceptable, production release needs commander approval. |
| Live environment | Real service and QR environments can differ, including CORS/network behavior. Official domains must be allowlisted where relevant. | QR and live checks remain required, especially for API, asset, and analytics endpoints. |
| Game Center availability | Game Center APIs are only for game-category mini apps. Non-game apps can fail or not work correctly. | Console category must be game. Runtime adapter keeps a mock fallback for non-Toss browser/CI. |
| Game Center version | Leaderboard open is supported from Toss app `5.221.0` on Android/iOS and can return `undefined` on unsupported versions. | Adapter checks `isMinVersionSupported` and maps unsupported versions. |
| Submit/open relationship | Score submission and leaderboard opening are independent. Submitting a score does not automatically open the leaderboard. | UI separates `submit` and `open` actions on the result screen. |
| Score format | Leaderboard score should be submitted as a numeric string. | Adapter converts local score to a string before submit. |
| Score validation | Toss Game Center does not provide separate server score validation; the game must validate score calculation itself. | Deterministic engine tests and clean-run fairness gates are mandatory. Real anti-tamper remains limited until server validation is added. |
| Leaderboard management | Leaderboard UI/data is managed by Toss Game Center; SDK does not directly edit/delete individual entries. | Avoid admin-like leaderboard assumptions in UI and docs. |
| SDK package | Current npm metadata reports `@apps-in-toss/web-framework@2.6.0` with Apps in Toss and Granite dependency set. | Adapter remains injected until local install is completed without timeout. |
| Console assets | Console logo requires a 600 x 600 PNG with a background. Thumbnail requires 1932 x 828 PNG. Screenshots are optional but vertical uploads require at least 3 images at 636 x 1048 PNG. | Harness ready. Run `npm run qa:console-assets` to generate upload-size PNGs from the current build. |
| Leaderboard setup | Console requires score unit, sort policy, and leaderboard settings. | Blocker. Use score unit `점`, higher-is-better sort, and clean-score policy only. |

## Current Gaps To Convert Into Queues

- Generate console-ready 600 x 600 PNG logo and 1932 x 828 PNG thumbnail with `npm run qa:console-assets`.
- Generate at least 3 vertical 636 x 1048 PNG screenshots for upload with `npm run qa:console-assets`.
- Prepare game rating evidence path and owner checklist.
- See `docs/platform/GAME_RATING_EVIDENCE.md` for the locked rating evidence checklist.
- Complete Toss QR test once console access and `.ait` bundle path are ready; record evidence with `npm run qa:qr-session`.
- Resolve official SDK package install/import. Phase 82 exact install still timed out after 10 minutes.
- Decide whether deterministic client validation plus leaderboard audit receipts are sufficient for MVP, or add a server verification layer before wider promotion.
