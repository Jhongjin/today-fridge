import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

process.stdout.on("error", (error) => {
  if (error.code === "EPIPE") {
    process.exit(0);
  }

  throw error;
});

const parseArgs = (argv) => {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith("--")) {
      continue;
    }

    const raw = item.slice(2);
    const equalsIndex = raw.indexOf("=");

    if (equalsIndex >= 0) {
      args[raw.slice(0, equalsIndex)] = raw.slice(equalsIndex + 1);
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[raw] = true;
      continue;
    }

    args[raw] = next;
    index += 1;
  }

  return args;
};

const valueOf = (args, key, fallback) => {
  const value = args[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const checkboxRows = (items) => items.map((item) => `- [ ] ${item}`).join("\n");

const renderSession = ({ commit, device, mode, platform, previewUrl, tester, tossVersion, timestamp }) => `# QR Session - ${platform} - ${mode}

## Metadata

| Field | Value |
| --- | --- |
| Created at | ${timestamp} |
| Tester | ${tester} |
| Platform | ${platform} |
| Device | ${device} |
| Toss app version | ${tossVersion} |
| Mode | ${mode} |
| Preview URL | ${previewUrl} |
| Commit | ${commit} |

## Version Gates

- Leaderboard submit/open minimum Toss app version: Android/iOS 5.221.0.
- Game user key minimum Toss app version: Android/iOS 5.232.0.
- Supported mode should produce \`game_user_key_result result:ready\`.
- Unsupported mode should avoid stuck UI and produce \`result:unavailable\` or \`result:error\`.

## Entry And Shell

${checkboxRows([
  "QR opens without blank screen.",
  "First playable screen appears within 10 seconds.",
  "Safe area does not overlap navigation, Dynamic Island, or home indicator.",
  "Close/back path returns to Toss without trapping the user.",
  "No visible text overlap on the device width.",
  "Sound mute toggle works and persists after reload.",
  "Background/foreground sound behavior is acceptable."
])}

## User Key

${checkboxRows([
  "Game user key request runs before or during first play.",
  "Supported path records game_user_key_result with result:ready.",
  "Unsupported or error path keeps gameplay available.",
  "No raw hash is exposed in visible UI or copied into session notes.",
  "Returning to the app preserves the expected player state."
])}

## Game Flow

${checkboxRows([
  "Clean route completes at 1,700 points.",
  "Hint booster marks the run outside clean leaderboard eligibility.",
  "Failed round can claim only the small participation reward.",
  "Restart increments the attempt count.",
  "Daily refresh and streak copy stay readable.",
  "Recipe book opens, scrolls, and closes."
])}

## Game Center

${checkboxRows([
  "Clean completion submits score only after the user taps submit.",
  "Duplicate submit for one play ID is blocked or gracefully skipped.",
  "Booster-assisted completion does not submit a clean score.",
  "Leaderboard opens only after the user taps the leaderboard action.",
  "Submit/open failures show recoverable copy instead of a stuck state."
])}

## Observability

${checkboxRows([
  "QA analytics or production transport shows app_open, first_playable_ready, round_start.",
  "Completion flow shows round_complete and mission_summary.",
  "Leaderboard flow shows leaderboard_submit and leaderboard_open.",
  "No console/page errors are observed during the QR flow.",
  "Any client_error or asset_load_error is copied into the notes below."
])}

## Evidence

| Artifact | Location |
| --- | --- |
| Entry screenshot |  |
| Result screenshot |  |
| Leaderboard screenshot |  |
| Error screenshot, if any |  |
| Screen recording, if any |  |
| Console/device log, if any |  |

## Notes

- TODO

## Commander Decision

- [ ] Pass
- [ ] Pass with follow-up
- [ ] Fail

Decision notes:

- TODO
`;

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const timestamp = new Date().toISOString();
  const platform = valueOf(args, "platform", "android");
  const mode = valueOf(args, "mode", "supported");
  const session = renderSession({
    commit: valueOf(args, "commit", "main"),
    device: valueOf(args, "device", "unknown-device"),
    mode,
    platform,
    previewUrl: valueOf(args, "preview-url", "pending"),
    tester: valueOf(args, "tester", "commander"),
    tossVersion: valueOf(args, "toss-version", "unknown"),
    timestamp
  });

  if (args.print) {
    process.stdout.write(session);
    return;
  }

  const fileName = `${timestamp.replace(/[:.]/g, "-")}-${slugify(platform)}-${slugify(mode)}.md`;
  const outputPath = valueOf(args, "output", join("qa", "qr-sessions", fileName));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, session, "utf8");

  console.log(`QR session written: ${outputPath}`);
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
