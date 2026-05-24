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

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

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

const checkboxRows = (items) => items.map((item) => `- [ ] ${item}`).join("\n");

const evidencePathLabel = (path) => (path === "grac-certificate" ? "GRAC certificate" : "Store self-rating");

const renderEvidence = ({ commit, generatedAt, path, reviewer, title }) => `# ${title}

## Metadata

| Field | Value |
| --- | --- |
| Generated at | ${generatedAt} |
| Reviewer | ${reviewer} |
| Commit | ${commit} |
| Evidence path | ${evidencePathLabel(path)} |
| Status | pending |

## Selected Evidence Path

${checkboxRows([
  "Store self-rating evidence is selected.",
  "GRAC certificate evidence is selected."
])}

Selection notes:

- TODO

## Store Self-Rating Evidence

Use this section when the same game has an eligible open-market release.

| Field | Value |
| --- | --- |
| Store URL | TODO |
| GRAC self-rating lookup URL | TODO |
| Registrant name | TODO |
| Self-rating operator | TODO |
| Rating classification date | TODO |
| Rating classification number | TODO |
| Age rating | TODO |
| Content descriptors | TODO |
| Representative seal/signature image | TODO |

Store self-rating checklist:

${checkboxRows([
  "Store URL opens the released Today Fridge build or matching game build.",
  "GRAC lookup record matches the store game and registrant.",
  "Registrant name matches the project owner or supporting explanation is linked.",
  "Two original gameplay screenshots from the store build are linked.",
  "Two original gameplay screenshots from the Apps in Toss build are linked."
])}

## GRAC Certificate Evidence

Use this section when the game has a direct Game Rating and Administration Committee certificate.

| Field | Value |
| --- | --- |
| Certificate PDF location | TODO |
| Rating classification date | TODO |
| Rating classification number | TODO |
| Age rating | TODO |
| Content descriptors | TODO |
| Representative seal/signature image | TODO |

GRAC certificate checklist:

${checkboxRows([
  "Certificate PDF is linked or stored in the approved evidence location.",
  "Certificate fields match the reviewed Today Fridge build.",
  "Two original gameplay screenshots from the Apps in Toss build are linked."
])}

## Gameplay Screenshots

| Screenshot | Source | Location |
| --- | --- | --- |
| Store gameplay 1 | store build | TODO |
| Store gameplay 2 | store build | TODO |
| Apps in Toss gameplay 1 | QR/review build | TODO |
| Apps in Toss gameplay 2 | QR/review build | TODO |

## Content Guardrails

${checkboxRows([
  "No betting, staking, cash-out, gambling-like loop, or random monetary reward.",
  "No score/rank/win/loss-based Toss point payout.",
  "No web-board classification mechanics such as card or betting-money competition.",
  "No paid, ad, share, or promotion advantage for clean leaderboard score.",
  "No chat, user-generated content, or user-to-user trading.",
  "No violent, sexual, alcohol, tobacco, or other age-sensitive content."
])}

## Commander Rating Decision

- [ ] Approved for Toss review request
- [ ] Needs rating evidence follow-up
- [ ] Blocked until rating evidence is complete

Decision notes:

- TODO
`;

const printHelp = () => {
  console.log("Usage: node scripts/create-game-rating-evidence.mjs [options]");
  console.log("");
  console.log("Options:");
  console.log("  --path <store-self-rating|grac-certificate>  Evidence path. Defaults to store-self-rating.");
  console.log("  --commit <sha>                              Reviewed commit SHA. Defaults to current git HEAD.");
  console.log("  --reviewer <name>                           Reviewer name. Defaults to commander.");
  console.log("  --title <text>                              Evidence document title.");
  console.log("  --output <path>                             Output evidence path.");
  console.log("  --print                                     Print evidence instead of writing a file.");
  console.log("  --help                                      Show this help.");
  console.log("");
  console.log("Creates a game rating evidence packet for commander review.");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const generatedAt = new Date().toISOString();
  const commit = valueOf(args, "commit", readCurrentCommit());
  const path = valueOf(args, "path", "store-self-rating");

  if (!["store-self-rating", "grac-certificate"].includes(path)) {
    throw new Error("--path must be store-self-rating or grac-certificate");
  }

  const evidence = renderEvidence({
    commit,
    generatedAt,
    path,
    reviewer: valueOf(args, "reviewer", "commander"),
    title: valueOf(args, "title", "Game Rating Evidence")
  });

  if (args.print) {
    process.stdout.write(evidence);
    return;
  }

  const fileName = `${generatedAt.replace(/[:.]/g, "-")}-${slugify(commit)}-game-rating-evidence.md`;
  const outputPath = valueOf(args, "output", join("qa", "rating-evidence", fileName));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, evidence, "utf8");

  console.log(`Game rating evidence written: ${outputPath}`);
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
