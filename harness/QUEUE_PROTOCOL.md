# QUEUE_PROTOCOL

## Queue States

- `queued`: ready to be picked up.
- `in_progress`: being designed or implemented.
- `review`: waiting for command-center review.
- `approved`: commander approved the queue result.
- `committed`: committed locally.
- `pushed`: pushed to GitHub and preview pipeline triggered.
- `released`: production deploy approved by commander.

## Completion Rule

A queue item is complete only when:

- Acceptance criteria are satisfied.
- Relevant review gate is passed.
- Strategy lock is not violated.
- Toss platform risks are checked when relevant.
- Command center explicitly approves the result.

## Commit Rule

After approval:

1. Stage only files belonging to the queue.
2. Commit with a focused message.
3. Push to GitHub.
4. Watch the preview validation/deploy result.

## Production Rule

Production deploy is never automatic from a normal commit. It requires:

- Commander manual workflow dispatch, or
- Commander-approved promotion of a preview deployment.

## Default Commit Message Format

Use:

```text
<area>: <queue result>
```

Examples:

```text
harness: establish command center workflow
design: define first daily board
game: implement tray matching prototype
platform: add toss sdk mock harness
```

