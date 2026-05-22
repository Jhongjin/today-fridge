# Command Center Harness

## Decision Protocol

Every major feature proposal must answer:

1. Does it support the daily fridge-cleaning fantasy?
2. Can the player understand it within 5 seconds?
3. Does it improve replay, collection, or fair competition?
4. Does it preserve readability for the target audience?
5. Does it comply with Toss platform constraints?

If the answer to any item is no, the feature goes to backlog or redesign.

## Cadence

- Strategy review before new feature branches.
- Systems review before prototype implementation.
- UX review after each playable screen.
- Platform QA review before SDK integration changes.
- Retention review before monetization or reward changes.

## Source Of Truth

- Strategy: `docs/strategy/STRATEGY_LOCK.md`
- Rules: `docs/design/GAME_SYSTEMS.md`
- Rewards: `docs/design/RETENTION_ECONOMY.md`
- UX/audio/visual: `docs/creative/UX_AUDIO_VISUAL.md`
- Platform/QA: `docs/platform/TOSS_QA_HARNESS.md`
- Agent roles: `agents/ROSTER.md`
- Queue protocol: `harness/QUEUE_PROTOCOL.md`
- Deployment pipeline: `docs/platform/DEPLOYMENT_PIPELINE.md`

## Commit And Deploy Protocol

- Every queue completion requires command-center approval.
- After approval, commit the queue as a focused unit.
- Push the commit to GitHub.
- Preview validation/deploy runs from GitHub Actions when configured.
- Production is not automatic from push; it requires commander approval through the production deploy workflow.
