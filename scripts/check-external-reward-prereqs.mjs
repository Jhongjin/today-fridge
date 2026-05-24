import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const externalRewardFlagKey = "VITE_TOSS_REAL_EXTERNAL_REWARDS";
const realClientFlagKey = "VITE_TOSS_REAL_CLIENT";

const requiredConsoleIds = [
  "VITE_TOSS_CONTACTS_VIRAL_MODULE_ID",
  "VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID",
  "VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID",
  "VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID",
  "VITE_TOSS_PROMOTION_CODE"
];

const parseArgs = (argv) => {
  const args = new Set();

  for (const item of argv) {
    if (item.startsWith("--")) {
      args.add(item.slice(2));
    }
  }

  return args;
};

const readValue = (env, key) => (env[key] ?? "").trim();

const presentStatus = (value) => (value.length > 0 ? "ready" : "missing");

export const checkExternalRewardPrereqs = (env = process.env, options = {}) => {
  const requireReal = options.requireReal === true;
  const realExternalRewardsRequested = readValue(env, externalRewardFlagKey) === "true";
  const rows = [
    {
      key: externalRewardFlagKey,
      source: "Vite build environment",
      expected: requireReal ? "true" : "true for real external reward QR candidates",
      status: realExternalRewardsRequested ? "ready" : requireReal ? "missing" : "not_requested"
    }
  ];

  if (!realExternalRewardsRequested && !requireReal) {
    return {
      ready: true,
      requested: false,
      requireReal,
      blockedReason: null,
      missingKeys: [],
      rows
    };
  }

  const realClientEnabled = readValue(env, realClientFlagKey) === "true";
  rows.push({
    key: realClientFlagKey,
    source: "Vite build environment",
    expected: "true",
    status: realClientEnabled ? "ready" : "missing"
  });

  for (const key of requiredConsoleIds) {
    rows.push({
      key,
      source: "Toss console / Vite build environment",
      expected: "present",
      status: presentStatus(readValue(env, key))
    });
  }

  const missingKeys = rows.filter((row) => row.status === "missing").map((row) => row.key);
  const missingConsoleId = requiredConsoleIds.some((key) => missingKeys.includes(key));
  const blockedReason = !realExternalRewardsRequested
    ? "REAL_EXTERNAL_REWARDS_REQUIRED"
    : !realClientEnabled
      ? "REAL_TOSS_CLIENT_REQUIRED"
      : missingConsoleId
        ? "EXTERNAL_REWARD_ENV_MISSING"
        : null;

  return {
    ready: missingKeys.length === 0,
    requested: realExternalRewardsRequested,
    requireReal,
    blockedReason,
    missingKeys,
    rows
  };
};

const printTable = (rows) => {
  console.log("| Key | Source | Expected | Status |");
  console.log("| --- | --- | --- | --- |");

  for (const row of rows) {
    console.log(`| ${row.key} | ${row.source} | ${row.expected} | ${row.status} |`);
  }
};

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const statusLabel = (result) => (result.ready ? (result.requested ? "ready" : "not requested") : "not ready");

const writeGitHubSummary = (result, args) => {
  if (!args.has("github-summary") || !process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  const rows = result.rows
    .map((row) => `| ${escapeCell(row.key)} | ${escapeCell(row.source)} | ${escapeCell(row.expected)} | ${escapeCell(row.status)} |`)
    .join("\n");
  const missing =
    result.missingKeys.length > 0 ? result.missingKeys.map((key) => `- ${key}`).join("\n") : "- None";

  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### External reward prerequisites

| Item | Value |
| --- | --- |
| Status | ${statusLabel(result)} |
| Real rewards requested | ${result.requested ? "yes" : "no"} |
| Require real mode | ${result.requireReal ? "yes" : "no"} |
| Blocked reason | ${escapeCell(result.blockedReason ?? "none")} |

| Key | Source | Expected | Status |
| --- | --- | --- | --- |
${rows}

## External Reward Missing Values

${missing}
`,
    "utf8"
  );
};

const printHelp = () => {
  console.log("Usage: node scripts/check-external-reward-prereqs.mjs [--require-real] [--json] [--github-summary] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --require-real                Require the real external reward build gate.");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --github-summary              Write a Markdown summary for GitHub Actions.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Fails when real external rewards are requested without the required Toss env values.");
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.has("help")) {
    printHelp();
    return;
  }

  const result = checkExternalRewardPrereqs(process.env, {
    requireReal: args.has("require-real")
  });

  writeGitHubSummary(result, args);

  if (args.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`External reward QR prerequisites: ${statusLabel(result)}`);

    if (result.blockedReason) {
      console.log(`Blocked reason: ${result.blockedReason}`);
    }

    console.log("");
    printTable(result.rows);

    if (!result.ready) {
      console.log("");
      console.log("Set the missing values before building a real external reward QR candidate.");
    }
  }

  if (!result.ready) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
