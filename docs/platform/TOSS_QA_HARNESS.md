# TOSS_QA_HARNESS

Checked: 2026-05-24

Target: `오늘의 냉장고`, Toss Apps in Toss H5 casual game.

## 1. Submission Principle

The game should be submitted as an Apps in Toss game mini app with:

- Fast load.
- 5-second understandability.
- Fair daily competition.
- Limited, explicit Toss SDK usage.
- Low policy risk.

## 2. Toss Features

| Feature | Use | QA Point |
| --- | --- | --- |
| Game user key | Save/user mapping | Handle unsupported version and errors |
| Leaderboard | Submit `오늘의 냉파 점수` | One score meaning, submit after round only |
| Leaderboard open | Ranking view | User-initiated, not automatic on entry |
| Share reward | Friend challenge | Reward only on qualifying share event |
| Rewarded ads | Optional recovery/bonus | Reward only on completed ad event |
| Promotion points | Fixed non-score rewards | Never score/rank/win/random based |

## 3. Constraints And Risks

- Target first playable UI within 10 seconds.
- Keep bundle size lean; target under 100MB uncompressed.
- Prefer CSR/SSG for H5.
- Avoid `eval` and unpredictable external code execution.
- Use secure network calls.
- Do not auto-open ads during active play.
- Do not make ranking advantages depend on ads, paid items, shares, or points.
- Ensure deterministic scoring for a given seed and move sequence.
- Prevent duplicate leaderboard submissions for the same play session.

## 4. Promotion Point Rules

Allowed:

- First launch.
- Tutorial completion.
- First game completion.
- Attendance mission.
- Event participation.
- Survey completion.

Forbidden:

- Score.
- Rank.
- Win/loss.
- Friend victory.
- Random reward.
- Probability.
- Number of share invite wins.
- Ad result tied to ranking.

Implementation guard:

`src/platform/externalRewardPolicy.ts`

Policy details:

`docs/platform/EXTERNAL_REWARD_POLICY.md`

Promotion review requirements:

`docs/platform/PROMOTION_REVIEW_REQUIREMENTS.md`

## 5. Event Logging

Required events:

| Event | Required properties |
| --- | --- |
| `app_open` | app_version, toss_app_version, platform, entry_source |
| `game_user_key_result` | result, error_code |
| `profile_gate_result` | status, user_key_status |
| `tutorial_start` | board_id |
| `tutorial_complete` | board_id, duration_ms |
| `round_start` | board_id, seed, attempt_no |
| `move_commit` | play_id, move_no, ingredient_id, tray_state_hash |
| `match_clear` | play_id, ingredient_id, combo_index |
| `recipe_complete` | play_id, recipe_id |
| `round_complete` | play_id, board_id, score, duration_ms, paused_ms, clear_count, recipe_count |
| `round_fail` | play_id, board_id, fail_reason |
| `leaderboard_submit` | play_id, score, status, error_code, board_id, seed, route_cells, route_ingredients, score_breakdown_receipt |
| `leaderboard_open` | source, status |
| `friend_challenge_open` | source, board_id |
| `friend_challenge_send` | board_id, status, reward_id |
| `share_reward_event` | event_type, board_id, reward_id, reward_amount, reward_unit |
| `ad_reward` | ad_group_id, status, event_type |
| `promotion_reward` | promotion_code, action, reward_id, amount, status, error_code |
| `client_error` | screen, code, message_hash |

## 6. QA Gates

Submission blockers:

- Text overlap on mobile viewports.
- First action unclear.
- No sound mute.
- Ads interrupt active play.
- Rewarded ads grant rewards before completion event.
- Share reward grants rewards before qualifying event.
- Toss points tied to score/rank/win/loss/random.
- Network failure causes stuck state.
- Profile/user-key unavailable path still allows ranked play input.
- Duplicate leaderboard submissions.
- Ranked score can be improved through paid/ad/share advantage.
- Friend challenge grants more than one fixed daily share reward.

## 7. Real Device Checks

- Toss app minimum version.
- QR test entry.
- Game user key issue path.
- Leaderboard score submit and reopen.
- Share reward close/completion/no-reward paths.
- Friend challenge reward grants only after successful share action and stays separate from clean ranked score.
- Rewarded ad load/show/close/reward/fail paths.
- Promotion test code path.
- Background/foreground sound pause.
- iOS and Android safe area.

For each physical device run, create a session file:

```bash
npm run qa:qr-session -- --platform ios --device "iPhone 15" --toss-version 5.232.0 --mode supported --preview-url <preview-or-qr-url> --commit <sha>
```

For external reward QR candidates, add `--external-rewards` so the session file includes contacts viral, rewarded-ad, promotion, duplicate-protection, and ranked-fairness evidence rows.

Use `docs/platform/QR_SESSION_HARNESS.md` as the evidence protocol.

Before commander approval, run `npm run qa:qr-session:check` to catch incomplete evidence files.
Use `npm run qa:qr-session:index` to summarize completed session files for the commander review packet.
When either command runs inside GitHub Actions, add `--github-summary` so QR readiness and open issues are visible in the workflow summary.

## 8. Browser Verification Harness

Use a Toss SDK wrapper with mock adapters.

Suggested structure:

| Layer | Role |
| --- | --- |
| `platform/tossClient` | Real Toss SDK wrapper |
| `platform/tossMockClient` | Browser/CI mock |
| `qa/scenarios` | Tutorial, round, ad, share, promotion cases |
| `qa/assertions` | UI, score determinism, event logs |
| `qa/artifacts` | Screenshots, traces, console logs |

Current QA bridge:

- Open `/?qa=toss-bridge`.
- The app installs `globalThis.__TODAY_FRIDGE_TOSS_BRIDGE__` only when no real bridge exists.
- Browser automation can read `globalThis.__TODAY_FRIDGE_TOSS_QA_EVENTS__` to assert score submit/open calls.
- The QA bridge returns a fake `getUserKeyForGame()` hash and records a `user-key` QA event.
- Open `/?qa=toss-bridge-error` to force a leaderboard submit failure and verify retry/recovery UI.
- Open `/?qa=toss-bridge-no-user-key` to force game user key unavailability and verify leaderboard submit is skipped without a platform submit call.
- The no-user-key QA path should show the profile gate and keep board, hint, and pause input disabled.
- Submit failure copy should say the submit temporarily failed and invite retry, while fairness skips should keep the clean-ranked explanation.

Real SDK QR candidate:

- Build with `VITE_TOSS_REAL_CLIENT=true` only for commander-approved QR previews.
- The QA bridge still wins when present, so `?qa=toss-bridge*` scenarios remain deterministic even in a real-SDK candidate build.
- Default browser, CI, and normal preview builds keep the local mock client.

Automation evidence summaries:

- Queue Preview writes SDK dependency triage, QA helper surface, Korean copy guard, external reward prerequisite, bundle budget, console asset, submission screenshot, and deploy prerequisite evidence to the workflow summary.
- QR session checks, QR indexes, commander packet checks, commander packet indexes, and submission screenshot capture can also write GitHub summaries when run with `--github-summary`.

External reward QA runner:

- `src/platform/externalRewardScenarios.ts` runs share, rewarded-ad, and promotion mock paths together.
- The runner must allow only fixed non-ranked rewards into the wallet.
- Blocked scenario reasons must include active-play ad interruption, score, rank, win/loss, random, and non-user-initiated promotion paths.
- `src/platform/rewardedAd.ts` requires a mock client load/show path before rewarded-ad grants.
- `src/platform/promotionReward.ts` exposes fixed-action promotion helpers for attendance/event-style rewards only.
- `src/platform/tossContactsViralClient.ts`, `src/platform/tossRewardedAdClient.ts`, and `src/platform/tossPromotionRewardClient.ts` normalize real SDK event/error shapes before future UI wiring.
- `npm run qa:qr-session -- --external-rewards` creates the evidence checklist for real contacts/ad/promotion QR runs.

Automated scenarios:

1. Load first playable UI within 10 seconds.
2. Capture 360x740, 390x844, 430x932 mobile screenshots.
3. Complete tutorial.
4. Complete one fixed-seed round.
5. Verify same seed and move sequence produce same score.
6. Mock leaderboard success, failure, duplicate submit.
7. Confirm leaderboard submit analytics contains the board seed, selected route, and score receipt.
7. Verify QA Toss bridge user-key/submit/open path.
8. Verify QA Toss bridge no-user-key profile gate path.
9. Mock share reward event variants through `src/platform/shareReward.ts`.
10. Mock rewarded ad load/show/completed, not-completed, duplicate, and active-play blocked paths through `src/platform/rewardedAd.ts`.
11. Mock promotion fixed-action helper and unsafe score/rank/win/random blocked paths through `src/platform/promotionReward.ts`.
12. Unit-test real SDK adapter normalization for contacts viral, full-screen ads, and promotion rewards.
13. Run integrated external reward scenarios through `src/platform/externalRewardScenarios.ts`.
14. Assert zero console errors and unhandled promise rejections.

## 9. Pre-Submission Checklist

- Latest Apps in Toss game guide reviewed.
- Toss SDK integration smoke test completed.
- Real-device QR approval or blocker recorded in the commander review packet.
- Reviewed commit, Queue Preview run URL, HTTPS preview/QR target, and QR session index evidence recorded in the commander review packet.
- Preview deploy approval, skipped-state acceptance, or blocker recorded in the commander review packet.
- Bundle size reviewed.
- CORS and production origins reviewed.
- Toss console setup approval or blocker recorded in the commander review packet.
- Error monitoring approval or explicit deferral recorded in the commander review packet.
- Source map process decided.
- Leaderboard score idempotency verified.
- Ads, share, and points do not affect ranked fairness.
- QR test passed.
- Rollback path identified.
