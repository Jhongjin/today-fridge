import { appendFileSync } from "node:fs";

const parseArgs = (argv) => {
  const args = new Set();

  for (const item of argv) {
    if (item.startsWith("--")) {
      args.add(item.slice(2));
    }
  }

  return args;
};

const required = [
  {
    key: "AUTO_DEPLOY_ENABLED",
    source: "GitHub repository variable",
    ready: (value) => value === "true",
    expected: "true"
  },
  {
    key: "VERCEL_TOKEN",
    source: "GitHub repository secret",
    ready: (value) => Boolean(value),
    expected: "present"
  },
  {
    key: "VERCEL_ORG_ID",
    source: "GitHub repository secret",
    ready: (value) => Boolean(value),
    expected: "present"
  },
  {
    key: "VERCEL_PROJECT_ID",
    source: "GitHub repository secret",
    ready: (value) => Boolean(value),
    expected: "present"
  }
];

const optional = [
  {
    key: "VITE_ANALYTICS_ENDPOINT",
    source: "Vite build environment / Vercel env",
    expected: "present when analytics delivery is approved"
  },
  {
    key: "VITE_ERROR_MONITORING_ENDPOINT",
    source: "Vite build environment / Vercel env",
    expected: "present when error monitoring is approved"
  }
];

const printHelp = () => {
  console.log("Usage: node scripts/check-deploy-prereqs.mjs [--json] [--strict] [--github-summary] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --strict                      Exit non-zero when required preview deploy values are missing.");
  console.log("  --github-summary              Write enabled output and a Markdown summary for GitHub Actions.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Reports required Vercel preview deployment values and optional monitoring endpoints.");
};

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const renderGitHubSummary = ({ ready, rows }) => `### Preview deploy prerequisites

| Key | Source | Expected | Status |
| --- | --- | --- | --- |
${rows.map((row) => `| ${escapeCell(row.key)} | ${escapeCell(row.source)} | ${escapeCell(row.expected)} | ${escapeCell(row.status)} |`).join("\n")}

${ready ? "Preview deploy prerequisites are ready." : "Preview deploy skipped. Set repository variable `AUTO_DEPLOY_ENABLED=true` and secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` to enable automatic preview deployments."}
`;

const writeGitHubActionsOutput = ({ ready, rows }) => {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `enabled=${ready ? "true" : "false"}\n`, "utf8");
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, renderGitHubSummary({ ready, rows }), "utf8");
  }
};

const args = parseArgs(process.argv.slice(2));

if (args.has("help")) {
  printHelp();
  process.exit(0);
}

const requiredRows = required.map((item) => {
  const value = process.env[item.key] ?? "";
  const ready = item.ready(value);

  return {
    key: item.key,
    source: item.source,
    expected: item.expected,
    status: ready ? "ready" : "missing"
  };
});
const optionalRows = optional.map((item) => {
  const value = process.env[item.key] ?? "";

  return {
    key: item.key,
    source: item.source,
    expected: item.expected,
    status: value ? "configured" : "not_configured"
  };
});
const rows = [...requiredRows, ...optionalRows];
const ready = requiredRows.every((row) => row.status === "ready");

if (args.has("github-summary")) {
  writeGitHubActionsOutput({ ready, rows });
}

if (args.has("json")) {
  console.log(
    JSON.stringify(
      {
        ready,
        requiredReady: ready,
        rows
      },
      null,
      2
    )
  );
} else {
  console.log(`Preview deploy prerequisites: ${ready ? "ready" : "not ready"}`);
  console.log("");
  console.log("| Key | Source | Expected | Status |");
  console.log("| --- | --- | --- | --- |");

  for (const row of rows) {
    console.log(`| ${row.key} | ${row.source} | ${row.expected} | ${row.status} |`);
  }

  if (!ready) {
    console.log("");
    console.log("Set the missing GitHub variable/secrets before expecting Queue Preview to deploy to Vercel.");
  }
}

if (args.has("strict") && !ready) {
  process.exitCode = 1;
}
