# TOSS_QA_HARNESS

Checked: 2026-05-22

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

## 5. Event Logging

Required events:

| Event | Required properties |
| --- | --- |
| `app_open` | app_version, toss_app_version, platform, entry_source |
| `game_user_key_result` | result, error_code |
| `tutorial_start` | board_id |
| `tutorial_complete` | board_id, duration_ms |
| `round_start` | board_id, seed, attempt_no |
| `move_commit` | play_id, move_no, ingredient_id, tray_state_hash |
| `match_clear` | play_id, ingredient_id, combo_index |
| `recipe_complete` | play_id, recipe_id |
| `round_complete` | play_id, board_id, score, duration_ms, clear_count, recipe_count |
| `round_fail` | play_id, board_id, fail_reason |
| `leaderboard_submit` | play_id, score, status, error_code, board_id, seed, route_cells, route_ingredients, score_breakdown_receipt |
| `leaderboard_open` | source, status |
| `share_reward_event` | event_type, reward_amount, reward_unit |
| `ad_reward` | ad_group_id, status, event_type |
| `promotion_reward` | promotion_code, amount, status, error_code |
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
- Duplicate leaderboard submissions.
- Ranked score can be improved through paid/ad/share advantage.

## 7. Real Device Checks

- Toss app minimum version.
- QR test entry.
- Game user key issue path.
- Leaderboard score submit and reopen.
- Share reward close/completion/no-reward paths.
- Rewarded ad load/show/close/reward/fail paths.
- Promotion test code path.
- Background/foreground sound pause.
- iOS and Android safe area.

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

Automated scenarios:

1. Load first playable UI within 10 seconds.
2. Capture 360x740, 390x844, 430x932 mobile screenshots.
3. Complete tutorial.
4. Complete one fixed-seed round.
5. Verify same seed and move sequence produce same score.
6. Mock leaderboard success, failure, duplicate submit.
7. Confirm leaderboard submit analytics contains the board seed, selected route, and score receipt.
7. Verify QA Toss bridge submit/open path.
8. Mock share reward event variants.
9. Mock rewarded ad loaded, reward, dismissed, failed.
10. Mock promotion success, budget exhausted, limit exceeded, unsupported version.
11. Assert zero console errors and unhandled promise rejections.

## 9. Pre-Submission Checklist

- Latest Apps in Toss game guide reviewed.
- Toss SDK integration smoke test completed.
- Bundle size reviewed.
- CORS and production origins reviewed.
- Error monitoring prepared.
- Source map process decided.
- Leaderboard score idempotency verified.
- Ads, share, and points do not affect ranked fairness.
- QR test passed.
- Rollback path identified.
