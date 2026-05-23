import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

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

const booleanOf = (args, key) => args[key] === true || args[key] === "true" || args[key] === "1";

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const checkboxRows = (items) => items.map((item) => `- [ ] ${item}`).join("\n");

const readCurrentCommit = () => {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "main";
  }
};

const readWorktreeStatus = () => {
  try {
    const output = execFileSync("git", ["status", "--short"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();

    if (output.length === 0) {
      return "clean";
    }

    return `dirty (${output.split(/\r?\n/).length} change(s))`;
  } catch {
    return "unknown";
  }
};

const renderExternalRewardSection = (enabled) => {
  if (!enabled) {
    return "";
  }

  return `## External Reward Approval

${checkboxRows([
  "Real external reward QR build used `npm run qr:external-rewards:build`.",
  "`npm run qr:external-rewards:preflight` passed with approved Toss console IDs.",
  "Contacts viral reward, close/no-reward, and error evidence are linked in the session index.",
  "Rewarded ad load/show/completion and close/failure evidence are linked in the session index.",
  "Promotion success/error or duplicate-protection evidence is linked in the session index.",
  "External rewards did not change clean ranked score, personal best, best route, move count, timer, or score receipt.",
  "Commander approved reward copy, budget exposure, and campaign timing before UI activation."
])}

External reward decision:

- [ ] Approved for next implementation queue
- [ ] Needs follow-up
- [ ] Rejected for now

Notes:

- TODO

`;
};

const renderGameRatingEvidenceSection = () => `## Game Rating Evidence Approval

${checkboxRows([
  "Rating evidence path is selected: Store self-rating or GRAC certificate.",
  "Store URL or certificate PDF location is recorded or linked.",
  "Rating classification date, number, age rating, and content descriptors are recorded.",
  "Registrant/operator name matches the project owner, or supporting explanation is linked.",
  "Required gameplay screenshots for the selected evidence path are linked.",
  "Today Fridge content guardrails still match the reviewed build."
])}

Rating evidence decision:

- [ ] Approved for Toss review request
- [ ] Needs rating evidence follow-up
- [ ] Blocked until rating evidence is complete

Notes:

- TODO

`;

const renderProductionMonitoringSection = () => `## Production Monitoring Approval

${checkboxRows([
  "Production monitoring endpoint owner is named, or the deferral owner is named.",
  "Retention policy for analytics and error-monitoring events is approved or explicitly deferred.",
  "Access controls for monitoring data are approved or explicitly deferred.",
  "`npm run deploy:check-prereqs` output is linked or summarized for endpoint configuration state.",
  "Production client-error review path is recorded or explicitly deferred."
])}

Production monitoring decision:

- [ ] Approved for production launch
- [ ] Explicitly deferred by commander
- [ ] Blocked until monitoring ownership is resolved

Notes:

- TODO

`;

const renderPacket = ({
  commit,
  externalRewards,
  generatedAt,
  previewUrl,
  reviewer,
  sessionIndex,
  title,
  worktreeStatus
}) => `# ${title}

## Metadata

| Field | Value |
| --- | --- |
| Generated at | ${generatedAt} |
| Reviewer | ${reviewer} |
| Commit | ${commit} |
| Working tree | ${worktreeStatus} |
| Preview URL | ${previewUrl} |
| QR session index | ${sessionIndex} |
| External reward review | ${externalRewards ? "yes" : "no"} |
| Game rating evidence | required |
| Production monitoring approval | required |

## Required Local Commands

Run these before commander approval:

\`\`\`bash
npm run qa:qr-session:check
npm run qa:qr-session:index -- --strict
npm run qa:korean-copy
npm run qa:console-assets
npm run sdk:dependency-triage -- --strict
npm run deploy:check-prereqs
\`\`\`

For external reward QR candidates, also run:

\`\`\`bash
npm run qr:external-rewards:preflight
\`\`\`

## Evidence Checklist

${checkboxRows([
  "Android supported QR session is complete and marked Pass or Pass with follow-up.",
  "iOS supported QR session is complete and marked Pass or Pass with follow-up.",
  "Unsupported or error-path QR session is complete when a device path is available.",
  "Session index has no open issues.",
  "No QR session includes raw game user key hashes.",
  "Entry, result, leaderboard, error, recording, and device-log artifact locations are filled or marked n/a.",
  "No console/page errors are observed, or every observed error has a linked note.",
  "Korean listing and metadata copy guard passed for this commit.",
  "Console logo, thumbnail, and upload screenshots were regenerated and dimensions verified.",
  "SDK dependency triage was refreshed for this commit and has no strict failures.",
  "Clean leaderboard submit and leaderboard open remain separate user actions.",
  "Profile/user-key unavailable path does not allow ranked play input.",
  "Clean ranked score is not affected by booster, share, ad, or promotion rewards."
])}

${renderGameRatingEvidenceSection()}${renderProductionMonitoringSection()}## Platform Decision

${checkboxRows([
  "First playable screen appears within 10 seconds on supported QR devices.",
  "Safe area is acceptable on tested iOS and Android devices.",
  "Back/close behavior returns to Toss without trapping the user.",
  "Sound mute and background/foreground behavior are acceptable.",
  "Bundle budget and source-map guard passed for the reviewed commit.",
  "Queue Preview GitHub Actions passed for the reviewed commit.",
  "Preview deploy skipped state is understood when Vercel secrets/vars are not configured.",
  "Production monitoring approval section is complete."
])}

${renderExternalRewardSection(externalRewards)}## Commander Decision

- [ ] Approved for next queue
- [ ] Approved with follow-up
- [ ] Blocked

Decision notes:

- TODO
`;

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const commit = valueOf(args, "commit", readCurrentCommit());
  const externalRewards = booleanOf(args, "external-rewards");
  const packet = renderPacket({
    commit,
    externalRewards,
    generatedAt,
    previewUrl: valueOf(args, "preview-url", "pending"),
    reviewer: valueOf(args, "reviewer", "commander"),
    sessionIndex: valueOf(args, "session-index", "qa/qr-sessions/INDEX.md"),
    title: valueOf(args, "title", "Commander QR Review Packet"),
    worktreeStatus: readWorktreeStatus()
  });

  if (args.print) {
    process.stdout.write(packet);
    return;
  }

  const fileName = `${generatedAt.replace(/[:.]/g, "-")}-${slugify(commit)}-commander-review${externalRewards ? "-external-rewards" : ""}.md`;
  const outputPath = valueOf(args, "output", join("qa", "review-packets", fileName));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, packet, "utf8");

  console.log(`Commander review packet written: ${outputPath}`);
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
