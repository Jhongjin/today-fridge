# DEPLOYMENT_PIPELINE

## Policy

Queue completion flow:

1. A queue item reaches its acceptance criteria.
2. The command center reviews the diff against the strategy lock and review gates.
3. The command center approves the queue completion.
4. The queue is committed with a focused commit message.
5. The commit is pushed to GitHub.
6. GitHub Actions validates the harness and app.
7. If deployment variables and secrets are configured, preview deployment runs automatically.
8. Production deployment happens only through commander approval.

## Remote

GitHub repository:

`https://github.com/Jhongjin/today-fridge.git`

## Branches

- `main`: commander-approved baseline.
- `queue/<slug>`: optional queue work branch for larger changes.
- `codex/<slug>`: optional implementation branch.

Small harness updates can go straight to `main` after command-center approval. App feature work should usually use a queue branch and preview deployment.

## Automatic Preview Deploy

Workflow:

`.github/workflows/queue-preview.yml`

Triggers:

- Push to `main`.
- Push to `queue/**`.
- Push to `codex/**`.
- Manual dispatch.

The workflow always validates required command-center files. It deploys preview only when all of these are configured:

- Repository variable `AUTO_DEPLOY_ENABLED=true`.
- Repository secret `VERCEL_TOKEN`.
- Repository secret `VERCEL_ORG_ID`.
- Repository secret `VERCEL_PROJECT_ID`.

Optional variable:

- `VERCEL_CLI_VERSION`, for example `latest` or a pinned version.
- `BUNDLE_BUDGET_BYTES`, when the default 5 MB static `dist` budget needs to be raised for approved assets.
- `VITE_ANALYTICS_ENDPOINT`, when preview/production builds should deliver analytics events to an HTTP endpoint after commander monitoring approval.
- `VITE_ERROR_MONITORING_ENDPOINT`, when preview/production builds should deliver only error-monitoring events to a dedicated HTTP endpoint after commander monitoring approval.
- `VITE_TOSS_REAL_CLIENT=true`, only for commander-approved QR-candidate previews that should load the official Apps in Toss SDK runtime client.
- `VITE_TOSS_REAL_EXTERNAL_REWARDS=true`, only with `VITE_TOSS_REAL_CLIENT=true` and commander-approved QR reward IDs.
- `VITE_TOSS_CONTACTS_VIRAL_MODULE_ID`, `VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID`, `VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID`, `VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID`, and `VITE_TOSS_PROMOTION_CODE`, only for real external reward QR candidates.

Preflight:

```bash
npm run deploy:check-prereqs
```

External reward QR candidate preflight:

```bash
npm run qr:external-rewards:preflight
```

The normal `npm run build` command also runs the external reward preflight. It is a no-op for mock/non-QR builds, but fails fast when `VITE_TOSS_REAL_EXTERNAL_REWARDS=true` is set without `VITE_TOSS_REAL_CLIENT=true` and all required Toss console IDs.

See `docs/platform/VERCEL_PREVIEW_SETUP.md` for setup steps and current skip diagnostics.

Validation includes:

- Unit tests.
- Korean listing and metadata copy guard.
- Production build.
- Static `dist` bundle budget check and source map guard.
- Console logo, thumbnail, and upload screenshot generation with dimension verification.
- Playwright mobile browser tests.

For automation evidence, `npm run --silent check:bundle -- --json` prints total bytes, budget bytes, source map paths, and file sizes after `npm run build`.

GitHub validation uses Node `24` because Apps in Toss SDK packaging dependencies include a Node `>=24` engine requirement.

## Commander Production Deploy

Workflow:

`.github/workflows/production-deploy.yml`

Trigger:

- Manual `workflow_dispatch` only.

Approval model:

- The job uses GitHub environment `commander-production`.
- Configure the environment in GitHub repository settings with required reviewers if you want GitHub to enforce a second approval click.
- Without environment reviewers, production is still manual because the workflow must be dispatched intentionally.

Production options:

- Promote an approved preview URL.
- Deploy an approved Git ref, default `main`.

## Secrets Setup

Set these in GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Set this repository variable:

- `AUTO_DEPLOY_ENABLED=true`

Keep `AUTO_DEPLOY_ENABLED` unset or false until a real app target exists.

## Commander Rule

No queue is considered complete until the command center says it is complete. Automatic deployment starts after the approved commit is pushed, not before.

## Runbook

Operational approval and failure triage are documented in `docs/platform/COMMANDER_DEPLOY_RUNBOOK.md`.
