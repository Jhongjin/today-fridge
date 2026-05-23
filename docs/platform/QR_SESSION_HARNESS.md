# QR_SESSION_HARNESS

## Purpose

Real Apps in Toss QR checks require a human-held device, but the evidence should be consistent enough for commander approval. This harness creates one Markdown session file per device run.

## Command

```bash
npm run qa:qr-session -- --platform android --device "Pixel 8" --toss-version 5.232.0 --mode supported --preview-url https://preview.example --commit main
```

Useful flags:

| Flag | Example | Notes |
| --- | --- | --- |
| `--platform` | `android`, `ios` | Device platform. |
| `--device` | `iPhone 15` | Exact physical device. |
| `--toss-version` | `5.232.0` | Toss app version on the device. |
| `--mode` | `supported`, `unsupported-user-key`, `unsupported-leaderboard` | Version/API path being tested. |
| `--preview-url` | `https://...` | Approved preview or QR target. |
| `--commit` | `4026818` | Git commit under test. |
| `--tester` | `commander` | Person running the device. |
| `--external-rewards` | | Add contacts/ad/promotion QR evidence sections. |
| `--external-reward-mode` | `real`, `blocked`, `mock` | External reward runtime being evidenced. Defaults to `real` when `--external-rewards` is set. |
| `--output` | `qa/qr-sessions/android.md` | Optional custom file path. |
| `--print` | | Print to stdout without writing a file. |

Default output:

`qa/qr-sessions/<timestamp>-<platform>-<mode>.md`

## Evidence Validation

Before commander approval, run:

```bash
npm run qa:qr-session:check
```

The checker fails when a session has unresolved `TODO` markers, blank artifact locations, missing required sections, or no checked commander decision. You can also validate a single file:

```bash
npm run qa:qr-session:check -- qa/qr-sessions/android.md
```

## Commander Index

To generate a review index for all session files:

```bash
npm run qa:qr-session:index
```

To write the index into the QR session folder:

```bash
npm run qa:qr-session:index -- --output qa/qr-sessions/INDEX.md
```

Use `--strict` when the index generation should fail unless at least one session exists and every session is complete.

## Commander Review Packet

After validating and indexing QR sessions, create a commander review packet:

```bash
npm run qa:commander-review-packet -- --commit <sha> --preview-url <preview-or-qr-url>
```

For external reward review:

```bash
npm run qa:commander-review-packet -- --commit <sha> --preview-url <preview-or-qr-url> --external-rewards
```

Default output:

`qa/review-packets/<timestamp>-<commit>-commander-review.md`

The generated packet includes the Korean copy guard in its required local commands. Run `npm run qa:korean-copy` before commander approval so listing, metadata, console asset, screenshot, and rating evidence copy are checked for required phrases and known mojibake markers.
It also includes a Toss Console Setup Approval section. Final Toss review approval requires console category, upload assets, leaderboard setup, bundle or `.ait` candidate path, QR target, and exactly one console setup decision.
It also includes an SDK Dependency Approval section. Final Toss review approval requires refreshed SDK triage output, Node 24 coverage notes, audit counts, and exactly one SDK dependency decision.
It also includes a Game Rating Evidence Approval section. Final Toss review approval requires one selected rating evidence path, linked classification evidence, required gameplay screenshots, and exactly one rating evidence decision.
It also includes a Production Monitoring Approval section. Preview or production approval requires endpoint owner, retention, access-control, and deploy-preflight endpoint state notes, plus exactly one monitoring decision.

## Required Session Set

Before Toss review request:

1. Android supported path: Toss app `5.232.0` or newer.
2. iOS supported path: Toss app `5.232.0` or newer.
3. Unsupported path if available:
   - Toss app below `5.232.0` for user-key fallback.
   - Toss app below `5.221.0` for leaderboard fallback.
4. External reward QR candidate path, only after commander approves the real reward env:
   - Add `--external-rewards`.
   - Run `npm run qr:external-rewards:preflight` before creating the QR build.
   - Use a QR build created with `npm run qr:external-rewards:build`.

## Evidence Rules

- Do not paste raw game user key hashes into session notes.
- Record screenshots or screen recording locations in the session file.
- Capture any observed `client_error`, `asset_load_error`, or console error in notes.
- For external reward sessions, capture contacts viral reward/close/error, rewarded-ad completion/failure, and promotion success/error or duplicate-protection evidence.
- Confirm external rewards do not change clean ranked score, personal best, best route, move count, timer, or score receipt.
- Mark `Pass`, `Pass with follow-up`, or `Fail` before commander production approval.

## Current Limitation

This harness prepares the evidence shape. It does not replace the real Apps in Toss console QR test, because real reward UI wiring remains commander-gated until QR/device evidence is collected.
