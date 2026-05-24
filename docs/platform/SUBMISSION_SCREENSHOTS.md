# SUBMISSION_SCREENSHOTS

## Phase 29 Scope

Submission screenshot capture is available through:

```bash
npm run qa:screenshots
```

Apps in Toss console upload assets are available through:

```bash
npm run qa:console-assets
```

Output:

`qa/artifacts/submission-screenshots/`

Console asset output:

`qa/artifacts/console-assets/`

The output folder is ignored by git.

## Captures

The script captures a 390x844 mobile viewport:

1. `01-first-playable.png`
2. `02-recipe-book.png`
3. `03-completion-result.png`
4. `04-reward-claimed.png`
5. `05-hint-fairness.png`
6. `06-qa-toss-bridge.png`

## Notes

- The script starts a local Vite dev server on `127.0.0.1:5174`.
- It closes the server after capture.
- It uses the same clean route covered by Playwright.
- It includes the recipe book and QA Toss bridge paths.
- These screenshots are QA candidates, not final store assets.

## Console Assets

`npm run qa:console-assets` generates:

1. `logo-600x600.png`
2. `thumbnail-1932x828.png`
3. `screenshot-01-first-playable-636x1048.png`
4. `screenshot-02-completion-result-636x1048.png`
5. `screenshot-03-recipe-book-636x1048.png`

The console-asset script prints a file table, verifies these PNG dimensions after capture, and fails if any generated file is off-spec.
In GitHub Actions, `npm run qa:console-assets -- --github-summary` writes the verified dimensions and file sizes to the workflow summary.

Commander review packets require `npm run qa:console-assets` before approval so upload asset dimensions are rechecked for the reviewed commit. The packet also requires a Toss Console Setup Approval decision before final console submission.

For automation evidence:

```bash
npm run --silent qa:screenshots -- --json
npm run --silent qa:console-assets -- --json
```

## Future Queue

Add QR-device screenshots after the real Apps in Toss runtime is configured.
