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

The preflight reports required Vercel deploy secrets and optional analytics/error-monitoring endpoints. Missing optional endpoints do not block preview deploy by themselves.

External reward QR candidate preflight:

```bash
npm run qr:external-rewards:preflight
```

QR review packet:

```bash
npm run qa:commander-review-packet -- --commit <sha> --preview-url <preview-or-qr-url>
```

If `--commit` is omitted, the packet uses the current local `git rev-parse --short HEAD` value.

The packet metadata includes the current local worktree status. Generate review packets from a clean tree after the intended commit is pushed.

The generated packet requires `npm run qa:korean-copy` before approval, so listing, HTML, manifest, console asset, screenshot, and rating evidence Korean copy are checked for required phrases and known mojibake markers.
It requires `npm run qa:console-assets`, so console logo, thumbnail, and upload screenshot dimensions are regenerated and verified against Toss console requirements.
It also requires a completed Real Device QR Approval section, so Android/iOS QR sessions, Game Center runtime evidence, safe-area/back/sound checks, and observed errors are captured as a decision.
It also requires a completed Toss Console Setup Approval section, so game category, upload assets, leaderboard settings, bundle upload candidate, preview/QR target, and console test/review state are captured as a decision.
It also requires `npm run sdk:dependency-triage -- --strict`, so SDK latest metadata, Node engine requirements, and audit counts are refreshed against the reviewed commit.
It also requires a completed SDK Dependency Approval section, so Node 24 coverage, audit counts, the no-force-fix policy, and remaining SDK risk are captured as a decision.
It also requires a completed Game Rating Evidence Approval section, so the selected store self-rating or GRAC certificate path, classification fields, owner-name consistency, gameplay screenshots, and content guardrails are reviewed before final Toss submission.
It also requires a completed Production Monitoring Approval section, so endpoint ownership, retention policy, access controls, deploy-preflight endpoint state, and any explicit deferral are captured as a decision.

After the packet is filled, run:

```bash
npm run qa:commander-review-packet:check -- <packet.md>
```

To summarize saved packets:

```bash
npm run qa:commander-review-packet:index -- --strict
```

The packet index includes `Required Commands`, QR, console setup, SDK dependency, rating evidence, and monitoring decision columns so missing approval evidence is visible before commander review.

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
- Real device QR evidence must be completed or blocked in the commander review packet before final Toss review approval.
- Korean listing and metadata copy must pass `npm run qa:korean-copy` before final review approval.
- Console upload assets must be regenerated with `npm run qa:console-assets` before final review approval.
- Toss console category, assets, leaderboard settings, bundle/QR target, and review state must be approved or blocked in the commander review packet.
- Game rating evidence must be completed in the commander review packet before final Toss review approval.
- SDK dependency tree must be refreshed with `npm run sdk:dependency-triage -- --strict`, and remaining SDK/audit risk must be approved or blocked in the commander review packet.
- Production monitoring endpoint owner, retention policy, and access controls must be approved or explicitly deferred in the commander review packet.
- Vercel preview deployment is currently skipped until `AUTO_DEPLOY_ENABLED`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured in GitHub.
