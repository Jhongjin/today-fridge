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

The script captures 360x740 and 390x844 first-fold mobile viewports. The remaining flow screenshots are full-page captures at 390x844:

1. `00-small-first-viewport.png`
2. `00-first-viewport.png`
3. `01-first-playable.png`
4. `02-recipe-book.png`
5. `03-completion-result.png`
6. `04-reward-claimed.png`
7. `05-hint-fairness.png`
8. `06-qa-toss-bridge.png`

## Notes

- The script starts a local Vite dev server on `127.0.0.1:5174`.
- It closes the server after capture.
- `00-small-first-viewport.png` is useful for checking the 360px minimum first impression before scrolling.
- `00-first-viewport.png` is useful for checking the actual Vercel/Toss first impression before scrolling.
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

Commander review packets require both `npm run qa:console-assets` and `npm run qa:screenshots` before approval so upload asset dimensions, 360/390 first-fold screenshots, and full-flow screenshot evidence are rechecked for the reviewed commit. The packet also requires a Toss Console Setup Approval decision before final console submission.

For automation evidence:

```bash
npm run --silent qa:screenshots -- --json
npm run --silent qa:screenshots -- --github-summary
npm run --silent qa:console-assets -- --json
```

## Future Queue

Add QR-device screenshots after the real Apps in Toss runtime is configured.
