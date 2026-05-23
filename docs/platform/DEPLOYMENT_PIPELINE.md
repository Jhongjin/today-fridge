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
- `VITE_ANALYTICS_ENDPOINT`, when preview/production builds should deliver analytics events to an HTTP endpoint.

Preflight:

```bash
npm run deploy:check-prereqs
```

See `docs/platform/VERCEL_PREVIEW_SETUP.md` for setup steps and current skip diagnostics.

Validation includes:

- Unit tests.
- Production build.
- Static `dist` bundle budget check and source map guard.
- Playwright mobile browser tests.

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
