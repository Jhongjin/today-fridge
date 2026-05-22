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
- Phase 3 CI hotfix: app check workflow split into dependency, unit, build, browser-install, and browser-test steps for actionable failure diagnosis.
- Phase 3 CI hotfix: Playwright locators switched to stable test IDs for mobile browser checks.
- Phase 3 CI hotfix: Playwright mobile viewport projects pinned to Chromium so CI only needs the Chromium browser install.
- Phase 4 platform adapter added: fairness flags, clean ranked score eligibility, idempotent leaderboard service, and unit tests.
- Phase 5 UX flow added: sound/motion toggles, first-play hint chips, and result-screen clean leaderboard submit action wired to mock platform service.
- Phase 6 content data added: app now carries 24 MVP ingredients, 20 MVP recipes, and content integrity tests.
- Phase 7 board validation added: first daily board has a tested clean completion route and UI score submission test.
- Phase 8 submission readiness documented against official Apps in Toss guides, with Toss SDK integration split into future queues.
- Phase 9 audio placeholder added: mute-aware sound event controller, gameplay event hooks, and audio event map.
- Phase 10 polish pass removed orb-like decoration, added focus styling, stabilized result panel width, and improved tile label readability.
