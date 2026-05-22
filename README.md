# Today Fridge

Toss Apps in Toss H5 casual game project.

Working title: `오늘의 냉장고`

One-line concept:

> A 60-second fridge-cleaning puzzle where players rescue leftover ingredients, complete a home meal, and compete on today's same board.

This repository is the command-center harness for strategy, design, platform constraints, agent roles, and execution gates before implementation begins.

## North Star

Make a casual game that is instantly understandable, gently competitive, and sticky through daily fridge boards, ingredient rescue, recipe collection, and friend score challenges.

## Target

- Primary: women in their 40s-50s using Toss casually.
- Context: short sessions inside Toss, likely one-handed, often with low tolerance for complex tutorials.
- Desired feeling: neat, thrifty, satisfying, lightly competitive.

## Current Status

- Strategy: locked in `docs/strategy/STRATEGY_LOCK.md`
- Game systems: drafted in `docs/design/GAME_SYSTEMS.md`
- Retention/economy: drafted in `docs/design/RETENTION_ECONOMY.md`
- UX/audio/visual: drafted in `docs/creative/UX_AUDIO_VISUAL.md`
- Toss/QA harness: drafted in `docs/platform/TOSS_QA_HARNESS.md`
- Agent roster: defined in `agents/ROSTER.md`
- Queue protocol: defined in `harness/QUEUE_PROTOCOL.md`
- Deployment pipeline: defined in `docs/platform/DEPLOYMENT_PIPELINE.md`

## Operating Rule

When a decision conflicts with novelty, monetization, or feature expansion, prefer:

1. 5-second understandability.
2. Fair daily competition.
3. Clear visual readability.
4. Positive food-rescue emotion.
5. Toss platform compliance.

## GitHub

Remote repository:

`https://github.com/Jhongjin/today-fridge.git`

Queue completion policy:

1. Command center approves the queue result.
2. Commit is created and pushed.
3. Preview validation/deploy pipeline runs automatically when configured.
4. Production deploy requires commander approval.
