# VERCEL_PREVIEW_SETUP

## Current Status

Observed on 2026-05-23:

- Queue Preview validation succeeds on GitHub Actions.
- Optional Preview Deploy succeeds as a job, but deploy steps are skipped because required Vercel prerequisites are not configured.
- Production deploy remains manual through the `Commander Production Deploy` workflow.

## Required GitHub Settings

Repository variable:

| Name | Value |
| --- | --- |
| `AUTO_DEPLOY_ENABLED` | `true` |

Repository secrets:

| Name | Source |
| --- | --- |
| `VERCEL_TOKEN` | Vercel account or team token. |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link`. |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link`. |

Never commit `.vercel/project.json` or token material. `.vercel/` is ignored in this repository.

## Setup Path

1. Create or select the Vercel project for `today-fridge`.
2. From the project root, run `vercel link` with the intended Vercel account/team.
3. Read `orgId` and `projectId` from `.vercel/project.json`.
4. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub repository secrets.
5. Add repository variable `AUTO_DEPLOY_ENABLED=true`.
6. Run Queue Preview again by pushing a queue commit or manually dispatching `.github/workflows/queue-preview.yml`.

Optional GitHub CLI form, if `gh` is installed and authenticated:

```bash
gh variable set AUTO_DEPLOY_ENABLED --body true
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

## Local Preflight

This command checks only environment presence and never prints secret values:

```bash
npm run deploy:check-prereqs
```

The preflight also reports optional `VITE_ANALYTICS_ENDPOINT` and `VITE_ERROR_MONITORING_ENDPOINT` rows. Missing optional endpoints do not make strict mode fail, but the commander review packet must record whether production monitoring is approved or explicitly deferred.

Strict mode exits non-zero when anything is missing:

```bash
npm run deploy:check-prereqs -- --strict
```

JSON mode is useful for automation:

```bash
npm run deploy:check-prereqs -- --json
```

## Success Criteria

A queue completion is fully preview-deployed when:

- `Validate Harness` passes.
- The Korean copy guard passes inside `Validate Harness`.
- Console assets are regenerated and dimension-checked inside `Validate Harness`.
- `Optional Preview Deploy` runs `Install Vercel CLI`, `Pull Vercel preview environment`, and `Deploy preview` instead of skipping those steps.
- The workflow summary contains a preview URL.
- The commander review packet records the production monitoring approval or deferral decision before production promotion.

Production is still blocked until the commander manually runs `Commander Production Deploy` against an approved commit or preview URL.
