# Decision Log

## 2026-05-22

- Chosen concept: `오늘의 냉장고`.
- Chosen genre framing: fridge-cleaning puzzle, not generic match-3.
- Primary target: Toss users, especially women in their 40s-50s.
- Core loop: daily fridge board, ingredient rescue, recipe completion, fair score competition.
- MVP leaderboard: one score named `오늘의 냉파 점수`.
- Monetization stance: optional rewarded ads and cosmetics; no pay-to-win ranked advantage.
- Harness created with strategy, systems, retention, creative, platform, command center, agent roster, and backlog documents.
- Global skills installed: define-goal, playwright, playwright-interactive, screenshot, security-best-practices, security-threat-model, vercel-deploy.
- Sub-agent outputs integrated by command center with a key correction: this remains a game, not a real fridge-management utility.
- GitHub remote set to `https://github.com/Jhongjin/today-fridge.git`.
- Deployment policy set: queue completion commits trigger preview pipeline when configured; production requires commander approval.
- Phase 1 prototype spec completed: ingredients, first 20 recipes, first daily board, score/recovery rules, first-screen wireframe, analytics schema, and framework decision.
- Framework decision: Vite + React + TypeScript, DOM/CSS grid for MVP board, pure TypeScript engine for deterministic board and score tests.
- Phase 2 playable scaffold started: Vite app shell, React DOM board, pure TypeScript game engine, mock Toss adapter, and CI app checks.
- Phase 3 QA harness added: Playwright mobile viewports, first-screen smoke test, basic interaction tests, and CI browser verification.
- Phase 3 CI hotfix: Vitest unit-test include narrowed so Playwright specs run only under Playwright.
