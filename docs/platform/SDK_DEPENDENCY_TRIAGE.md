# SDK_DEPENDENCY_TRIAGE

Checked: 2026-05-23

## Purpose

Track Apps in Toss SDK dependency warnings separately from gameplay work, so final submission does not hide package/runtime risk behind the QR checklist.

## Current Runtime Position

| Item | Current State | Decision |
| --- | --- | --- |
| Local validation runtime | Node `22.22.0`, npm `10.9.4` from `.tools/` | Keep for local continuity until a bundled Node 24 runtime is added. |
| GitHub validation runtime | `actions/setup-node@v6` with Node `24` | Use CI to cover the SDK engine requirement. |
| SDK package | `@apps-in-toss/web-framework@2.6.0` | Keep pinned; it is the current npm latest. |
| SDK engine warning source | `@apps-in-toss/ait-format@1.0.0` declares `node >=24` | Treat Node 24 as the QR/CI target. |

## Audit Snapshot

Commands:

```bash
npm audit --omit=dev --json
npm audit --json
npm view @apps-in-toss/web-framework version versions --json
```

Results:

| Scope | Total | Low | Moderate | High | Critical |
| --- | ---: | ---: | ---: | ---: | ---: |
| Production dependencies | 28 | 5 | 5 | 17 | 1 |
| Full dependency tree | 31 | 5 | 8 | 17 | 1 |

Primary clusters:

- `@apps-in-toss/web-framework@2.6.0` pulls Apps in Toss CLI/framework/plugins, Granite, Fastify, and React Native compatibility packages that account for most production audit findings.
- `@fastify/middie` contributes the single critical finding through the Granite packaging path.
- `vite` and `vitest` contribute dev/build-time moderate findings; npm suggests semver-major upgrades (`vite@8`, `vitest@4`) that need a separate compatibility queue.

## Fix Policy

- Do not run `npm audit fix --force` on the SDK tree.
- npm currently suggests `@apps-in-toss/web-framework@1.14.1` as a semver-major fix path for several SDK-related findings, which would downgrade away from the locked current SDK line and invalidate the API map.
- Prefer one of these paths before final submission:
  - Apps in Toss publishes a newer `2.x` SDK with patched transitive packages.
  - Toss confirms the CLI/packaging-only findings are not loaded in the shipped browser runtime.
  - The project adds an approved server/build isolation note for packaging-only dependencies.
  - A commander-approved compatibility queue upgrades Vite/Vitest separately.

## Submission Blocker

Final Toss review should not be requested until this triage is revisited with the actual QR/review candidate commit and the latest SDK package metadata.
