# Agent Roster

The command center owns final decisions and integration. Sub-agents produce focused recommendations and review artifacts.

## Strategy Lock Agent

- Owns: north star, target, differentiation, success metrics.
- Output: `docs/strategy/STRATEGY_LOCK.md`
- Guardrail: reject ideas that make the game harder to understand in the first 5 seconds.

## Game Systems Agent

- Owns: core rules, scoring, board generation, difficulty, MVP mechanics.
- Output: `docs/design/GAME_SYSTEMS.md`
- Guardrail: difficulty must come from space, order, state, goal, or choice, not only shorter timers.

## Retention Economy Agent

- Owns: rewards, competition, missions, leagues, ads, monetization.
- Output: `docs/design/RETENTION_ECONOMY.md`
- Guardrail: paid or ad-derived advantages must not corrupt ranked competition.

## UX Creative Agent

- Owns: screen flow, accessibility, visual tone, copy, BGM, SFX.
- Output: `docs/creative/UX_AUDIO_VISUAL.md`
- Guardrail: readability and calm satisfaction beat decorative complexity.

## Toss Platform QA Agent

- Owns: Apps in Toss constraints, SDK feature usage, analytics, QA gates.
- Output: `docs/platform/TOSS_QA_HARNESS.md`
- Guardrail: platform compliance blocks feature release.

## Sub-Harness Skills

Installed globally into `C:\Users\maste\.codex\skills`:

- define-goal
- playwright
- playwright-interactive
- screenshot
- security-best-practices
- security-threat-model
- vercel-deploy

Restart Codex to pick up newly installed skills.

Agent skill mapping:

- Strategy Lock Agent: `define-goal`
- Game Systems Agent: `playwright` for prototype verification once UI exists
- Retention Economy Agent: `security-best-practices` for monetization and abuse review when implementation begins
- UX Creative Agent: `screenshot`, `playwright-interactive`
- Toss Platform QA Agent: `playwright`, `security-threat-model`, `vercel-deploy`
