# ANALYTICS_SCHEMA

## 1. Principles

Analytics must answer three questions:

1. Do players understand and complete the first round?
2. Do players replay for a better score?
3. Do platform integrations work without policy or fairness risk?

Do not collect unnecessary personal data. Use Toss game user key only through the platform abstraction.

## 2. Shared Event Fields

Every event should include:

| Field | Type | Notes |
| --- | --- | --- |
| `event_name` | string | Event name |
| `event_time` | ISO string | Client timestamp |
| `app_version` | string | Build version |
| `platform` | string | `ios`, `android`, `web`, `unknown` |
| `entry_source` | string | Toss entry, share, direct, test |
| `session_id` | string | Generated per app session |
| `user_key_status` | string | `ready`, `mock`, `unavailable`, `error` |

## 3. Core Funnel Events

| Event | Required Properties |
| --- | --- |
| `app_open` | `entry_source`, `toss_app_version` |
| `first_playable_ready` | `load_ms` |
| `tutorial_start` | `board_id` |
| `tutorial_step_complete` | `step_id`, `duration_ms` |
| `tutorial_complete` | `board_id`, `duration_ms` |
| `round_start` | `play_id`, `board_id`, `seed`, `attempt_no`, `ranked_mode` |
| `game_pause` | `play_id`, `moves_used`, `score`, `active_duration_ms`, `total_paused_ms` |
| `game_resume` | `play_id`, `moves_used`, `score`, `paused_ms`, `total_paused_ms`, `active_duration_ms` |
| `move_commit` | `play_id`, `move_no`, `ingredient_id`, `tray_state_hash` |
| `match_clear` | `play_id`, `ingredient_id`, `count`, `combo_index`, `points` |
| `recipe_complete` | `play_id`, `recipe_id`, `points` |
| `expiring_rescue` | `play_id`, `ingredient_id`, `points` |
| `booster_use` | `play_id`, `booster_id`, `ranked_mode` |
| `round_complete` | `play_id`, `score`, `score_tier`, `duration_ms`, `paused_ms`, `moves_used`, `recipe_count`, `rescued_count` |
| `round_fail` | `play_id`, `fail_reason`, `move_no`, `tray_state_hash` |
| `mission_summary` | `play_id`, `completed_count`, `total_count`, `recipe_completed`, `rescue_completed`, `clean_record_completed` |
| `audio_visibility_change` | `play_id`, `hidden` |
| `setting_toggle` | `setting_id`, `enabled` |

## 4. Competition Events

| Event | Required Properties |
| --- | --- |
| `leaderboard_submit` | `play_id`, `score`, `ranked_mode`, `status`, `error_code`, `board_id`, `seed`, `route_cells`, `route_ingredients`, `score_breakdown_receipt` |
| `leaderboard_open` | `source`, `status` |
| `friend_challenge_open` | `source`, `board_id` |
| `friend_challenge_send` | `board_id`, `status` |
| `personal_best_update` | `old_score`, `new_score`, `delta` |
| `best_route_deviation` | `play_id`, `step_no`, `matched_steps`, `expected_cell_id`, `selected_cell_id` |

## 5. Economy And Reward Events

| Event | Required Properties |
| --- | --- |
| `daily_reward_claim` | `reward_id`, `reward_type`, `amount`, `status` |
| `recipe_piece_award` | `recipe_id`, `source`, `amount` |
| `coin_award` | `source`, `amount` |
| `rewarded_ad_offer` | `placement`, `reward_type`, `amount` |
| `rewarded_ad_complete` | `placement`, `reward_type`, `amount`, `status` |
| `promotion_reward` | `promotion_code`, `status`, `error_code` |

## 6. Fairness And Policy Flags

Add these properties to relevant events:

| Field | Type | Meaning |
| --- | --- | --- |
| `ranked_mode` | boolean | Clean ranked score mode |
| `booster_used` | boolean | Any booster used |
| `ad_recovery_used` | boolean | Any ad recovery used |
| `share_bonus_used` | boolean | Share reward affected run |
| `score_submittable` | boolean | Can submit to clean leaderboard |
| `score_breakdown_receipt` | string | Deterministic score component receipt for later server-side validation |

Clean leaderboard submit condition:

```text
ranked_mode == true
AND booster_used == false
AND ad_recovery_used == false
AND share_bonus_used == false
```

## 7. KPI Mapping

| KPI | Events |
| --- | --- |
| First round start rate | `app_open`, `round_start` |
| First playable load | `app_open`, `first_playable_ready` |
| Tutorial completion | `tutorial_start`, `tutorial_complete` |
| First round completion | `round_start`, `round_complete` |
| Mission completion | `mission_summary` |
| Replay rate | multiple `round_start` per `session_id` |
| Leaderboard engagement | `leaderboard_submit`, `leaderboard_open` |
| Friend challenge | `friend_challenge_open`, `friend_challenge_send` |
| Ad opt-in | `rewarded_ad_offer`, `rewarded_ad_complete` |
| Policy safety | `promotion_reward`, fairness flags |

## 8. Debug Events

Use only in development or sampled production logs:

- `client_error`
- `unhandled_rejection`
- `asset_load_error`
- `audio_visibility_change`
- `score_determinism_mismatch`
- `sdk_mock_mode_used`
