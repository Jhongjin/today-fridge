# Phase 147 Brief - Queue Preview Run URL Env Default

## Why

The review packet now requires a Queue Preview run URL. When packet generation happens inside GitHub Actions or automation, the repository and run id already exist in the environment, so the generator can fill the URL without extra arguments.

## Changed

- Added GitHub Actions environment fallback for `Queue Preview run` metadata.
- `--actions-run-url` remains the explicit local override.
- Updated deploy and QR packet docs, backlog, and decision log.

## Validation

- `node --check scripts/create-commander-review-packet.mjs`
- `npm run qa:commander-review-packet -- --print --commit <sha> --preview-url https://preview.example` with `GITHUB_REPOSITORY` and `GITHUB_RUN_ID` set
- `npm run qa:commander-review-packet -- --print --commit <sha> --actions-run-url <url> --preview-url https://preview.example`
- `npm run qa:commander-review-packet:check -- --stdin --expected-commit <sha>`
- `npm run qa:commander-review-packet:index --if-present`
- `npm run deploy:check-prereqs --if-present`
- `npm run qa:korean-copy --if-present`
- `npm run qa:console-assets --if-present`
- `npm run sdk:dependency-triage -- --strict`
- `npm test --if-present`
- `npm run build --if-present`
- `npm run check:bundle --if-present`
- `npm run test:e2e --if-present`

## Notes

- Local packet generation still needs an explicit run URL unless the GitHub Actions environment variables are set.
