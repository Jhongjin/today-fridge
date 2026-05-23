# COMMANDER_DEPLOY_RUNBOOK

## Phase 28 Scope

This runbook describes how the commander approves preview and production deployment.

## Queue Completion

For each queue:

1. Local verification passes, or the queue is explicitly docs-only.
2. The command center commits the queue.
3. The command center pushes to `main`.
4. `Queue Preview` GitHub Actions must complete successfully.
5. If preview deployment variables/secrets are configured, the same workflow deploys a preview automatically.

## Preview Auto-Deploy Requirements

Repository variable:

- `AUTO_DEPLOY_ENABLED=true`

Repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Optional variable:

- `VERCEL_CLI_VERSION`

If any value is missing, validation still runs and preview deployment is skipped with a workflow summary note.

Local preflight:

```bash
npm run deploy:check-prereqs
```

External reward QR candidate preflight:

```bash
npm run qr:external-rewards:preflight
```

QR review packet:

```bash
npm run qa:commander-review-packet -- --commit <sha> --preview-url <preview-or-qr-url>
```

If `--commit` is omitted, the packet uses the current local `git rev-parse --short HEAD` value.

The generated packet requires `npm run sdk:dependency-triage -- --strict` before approval, so SDK latest metadata, Node engine requirements, and audit counts are refreshed against the reviewed commit.

Setup details:

`docs/platform/VERCEL_PREVIEW_SETUP.md`

## Production Approval

Production workflow:

`.github/workflows/production-deploy.yml`

Trigger:

- Manual `workflow_dispatch`.

Inputs:

- `ref`: Git ref to deploy. Default `main`.
- `preview_url`: optional approved preview URL to promote.

Approval gate:

- GitHub environment `commander-production`.

Commander rule:

- Do not run production deploy from a failing `Queue Preview` commit.
- Prefer promoting an already-tested preview URL when available.
- If rebuilding from `main`, confirm the exact commit SHA first.

## Failure Triage

If `Queue Preview` fails:

1. Open the failed run.
2. Check `Validate Harness` first.
3. If unit tests fail, fix pure logic before UI.
4. If build fails, check TypeScript errors before Vite output.
5. If browser tests fail, inspect the Playwright trace and screenshot.
6. Commit the smallest fix and push again.

If preview deploy is skipped:

1. Confirm `AUTO_DEPLOY_ENABLED`.
2. Confirm all Vercel secrets exist.
3. Confirm the repository is linked to the intended Vercel project.

If production deploy fails:

1. Do not retry blindly.
2. Confirm credentials and project id.
3. Confirm the approved ref or preview URL.
4. Re-run only after the cause is known.

## Current Known Blockers

- Real Toss SDK QR/device validation is pending.
- SDK dependency tree must be refreshed with `npm run sdk:dependency-triage -- --strict` before final submission.
- Production monitoring transport is pending.
- Vercel preview deployment is currently skipped until `AUTO_DEPLOY_ENABLED`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured in GitHub.
