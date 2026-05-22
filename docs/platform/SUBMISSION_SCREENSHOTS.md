# SUBMISSION_SCREENSHOTS

## Phase 29 Scope

Submission screenshot capture is available through:

```bash
npm run qa:screenshots
```

Output:

`qa/artifacts/submission-screenshots/`

The output folder is ignored by git.

## Captures

The script captures a 390x844 mobile viewport:

1. `01-first-playable.png`
2. `02-completion-result.png`
3. `03-reward-claimed.png`
4. `04-hint-fairness.png`

## Notes

- The script starts a local Vite dev server on `127.0.0.1:5174`.
- It closes the server after capture.
- It uses the same clean route covered by Playwright.
- These screenshots are QA candidates, not final store assets.

## Future Queue

Add QR-device screenshots after the real Apps in Toss runtime is configured.
