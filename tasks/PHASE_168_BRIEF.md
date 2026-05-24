# Phase 168 Brief - Commander Packet Check Summary

## Why

Commander packet checks can be run locally or inside automation, but the checker only printed logs/JSON. A GitHub summary makes packet readiness, key metadata, and issue count visible without opening raw logs.

## Changed

- Added `--github-summary` support to `scripts/check-commander-review-packet.mjs`.
- Expanded checker help output to list supported expected-metadata, JSON, summary, and help options.
- Updated the commander runbook, backlog, and decision log.

## Validation

- `node --check scripts/check-commander-review-packet.mjs`
- `npm run qa:commander-review-packet:check -- --help`
- `git diff --check`
- Generated an incomplete packet and ran `scripts/check-commander-review-packet.mjs --stdin --json --github-summary`; it failed as expected and wrote the GitHub summary.

## Notes

- The checker still exits non-zero when packets are incomplete; summary writing happens before that exit.
