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
| `--output` | `qa/qr-sessions/android.md` | Optional custom file path. |
| `--print` | | Print to stdout without writing a file. |

Default output:

`qa/qr-sessions/<timestamp>-<platform>-<mode>.md`

## Required Session Set

Before Toss review request:

1. Android supported path: Toss app `5.232.0` or newer.
2. iOS supported path: Toss app `5.232.0` or newer.
3. Unsupported path if available:
   - Toss app below `5.232.0` for user-key fallback.
   - Toss app below `5.221.0` for leaderboard fallback.

## Evidence Rules

- Do not paste raw game user key hashes into session notes.
- Record screenshots or screen recording locations in the session file.
- Capture any observed `client_error`, `asset_load_error`, or console error in notes.
- Mark `Pass`, `Pass with follow-up`, or `Fail` before commander production approval.

## Current Limitation

This harness prepares the evidence shape. It does not replace the real Apps in Toss console QR test, because the official SDK import and QR runtime are still pending.
