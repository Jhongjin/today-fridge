# UX_AUDIO_VISUAL

## 1. Creative Goal

The game should leave the player feeling:

> "정리됐다. 아깝던 재료를 살렸다. 한 판 더 하면 더 잘할 수 있겠다."

It is a game, not a real fridge management app. All UX must point toward a fast playable fridge puzzle.

## 2. UX Principles

- First screen should be playable, not a landing page.
- The first action should be obvious without long text.
- Information must be large and readable.
- Mistakes should feel recoverable.
- Competition should be visible but not harsh.
- Cleanup should be visually satisfying.

## 3. First Screen

Immediately show:

- Today's fridge board.
- Today's recipe or rescue goal.
- My best score.
- A visible first hinted action on the board.
- Leaderboard/friend challenge entry.

Avoid:

- Marketing hero page.
- Long tutorial copy.
- App-like grocery/fridge data entry.

## 4. Play Screen Layout

Recommended top-to-bottom layout:

1. Status bar: score, moves/time, pause.
2. Goal strip: recipe target and expiring rescue count.
3. Fridge board: large ingredient tiles.
4. Prep tray: fixed slots with stable dimensions.
5. Booster row: three large icon buttons.

Touch targets should be at least 48px equivalent. Important text should be 18px or larger where possible.

## 5. Interaction

Primary:

- Tap ingredient to move to tray.
- Tap booster, then tap target.
- Tap recipe goal to preview required ingredients.

Secondary:

- Drag may be supported, but never required.
- Undo/recovery should be available through booster or result flow.

Avoid:

- Long press as required action.
- Tiny close buttons.
- Dense toolbars.
- Hidden gestures.

## 6. Visual Tone

Keywords:

- Clean kitchen.
- Familiar Korean home ingredients.
- Bright, practical, warm.
- Cute but not childish.
- Clear silhouettes over decorative detail.
- Soft mint, peach, blue, and berry accents that feel like a casual game HUD rather than a document form.

Palette:

- Base: white, light gray.
- Core accents: herb green, tomato red, egg yellow.
- Support: stainless blue-gray, charcoal.

Avoid a one-note beige/cream look. Ingredients should carry much of the color.

Result and collection panels should keep the same warm kitchen tone as the main screen. Use ingredient chips, soft progress bars, and clear action buttons so rewards and recipe progress feel collectible without looking like an admin report.

## 7. Ingredient Art Direction

- Use clear, recognizable shapes.
- Icons must remain readable at mobile sizes.
- Distinguish similar ingredients by shape and label, not color alone.
- Expiring state should use icon, border, and label together.
- Frozen state should use frost overlay and icon, not only blue tint.

## 8. Copy Tone

Use positive, practical, short copy.

Good:

- "오늘 먼저 살릴 재료예요"
- "남은 재료가 한 끼로 완성됐어요"
- "한 수만 더 깔끔했어요"
- "점수와 무관하게 참여 보상을 받을 수 있어요"

Avoid:

- "실패"
- "또 버리셨네요"
- "빨리 처리하세요"
- "이걸 못하면 손해"

## 9. BGM

See `docs/creative/BGM_DIRECTION.md` for the locked production direction.

Direction:

- Warm kitchen casual.
- Acoustic guitar, light piano, marimba, soft percussion.
- 72-100 BPM.
- Low-fatigue loop.

Avoid:

- Childish toy melodies.
- Tense countdown music.
- Loud reward fanfare.
- Repetitive high-pitched alert tones.

## 10. SFX

See `docs/creative/SFX_TRIGGER_MAP.md` for the locked production trigger map.

Useful sound map:

- Fridge open: short soft door sound.
- Ingredient select: light tap.
- Tray placement: airtight container click.
- Match clear: clean pop or chime.
- Recipe complete: 2-3 second warm jingle.
- Expiring rescue: fresh sparkle.
- Pause/resume: two very short low-fatigue ticks.
- Warning: low soft tone, never sharp alarm.

Provide separate controls for BGM, SFX, and vibration.

## 11. Accessibility

- Minimum body text 16-18px.
- Main score/goal text 18-22px.
- 48px touch target minimum.
- Do not rely on color only.
- Provide motion reduction.
- Provide quiet mode.
- Pause sounds on background.
- No rapid flashing.

## 12. Fatigue Risks

Risks:

- Too many small ingredients.
- Timer anxiety.
- Overly busy popups.
- Reward animation repetition.
- Leaderboard shame.
- Expiration warnings feeling like scolding.

Mitigations:

- Start with few ingredient types.
- Use move limits before tight timers.
- Keep result screen short.
- Use around-my-rank and personal best.
- Phrase warnings as rescue opportunities.
