import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const parseArgs = (argv) => new Set(argv.filter((item) => item.startsWith("--")).map((item) => item.slice(2)));

const helpers = [
  {
    script: "scripts/build-commander-review-index.mjs",
    required: ["--help", "--json", "--github-summary", "--strict", "--output", "--dir"]
  },
  {
    script: "scripts/build-qr-session-index.mjs",
    required: ["--help", "--json", "--github-summary", "--strict", "--output", "--dir"]
  },
  {
    script: "scripts/capture-console-assets.mjs",
    required: ["--help", "--json", "--github-summary"]
  },
  {
    script: "scripts/capture-submission-screenshots.mjs",
    required: ["--help", "--json", "--github-summary"]
  },
  {
    script: "scripts/check-bundle-budget.mjs",
    required: ["--help", "--json", "--github-summary"]
  },
  {
    script: "scripts/check-commander-review-packet.mjs",
    required: ["--help", "--json", "--github-summary", "--expected-commit", "--expected-actions-run-url", "--expected-preview-url", "--expected-session-index"]
  },
  {
    script: "scripts/check-deploy-prereqs.mjs",
    required: ["--help", "--json", "--github-summary", "--strict"]
  },
  {
    script: "scripts/check-external-reward-prereqs.mjs",
    required: ["--help", "--json", "--github-summary", "--require-real"]
  },
  {
    script: "scripts/check-korean-copy.mjs",
    required: ["--help", "--json", "--github-summary"]
  },
  {
    script: "scripts/check-qr-session-evidence.mjs",
    required: ["--help", "--json", "--github-summary", "--dir"]
  },
  {
    script: "scripts/check-sdk-dependency-triage.mjs",
    required: ["--help", "--json", "--github-summary", "--strict"]
  },
  {
    script: "scripts/check-qa-helper-surface.mjs",
    required: ["--help", "--json", "--github-summary"]
  },
  {
    script: "scripts/create-commander-review-packet.mjs",
    required: ["--help", "--print", "--output", "--external-rewards"]
  },
  {
    script: "scripts/create-game-rating-evidence.mjs",
    required: ["--help", "--print", "--output", "--path"]
  },
  {
    script: "scripts/create-qr-session.mjs",
    required: ["--help", "--print", "--output", "--external-rewards"]
  }
];

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const printHelp = () => {
  console.log("Usage: node scripts/check-qa-helper-surface.mjs [--json] [--github-summary] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --github-summary              Write a Markdown summary for GitHub Actions.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Checks QA helper --help output for required automation flags.");
};

const readHelp = (script) =>
  execFileSync(process.execPath, [script, "--help"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

const checkHelper = (helper) => {
  try {
    const help = readHelp(helper.script);
    const missing = helper.required.filter((flag) => !help.includes(flag));

    return {
      script: helper.script,
      status: missing.length === 0 ? "ready" : "not_ready",
      required: helper.required,
      missing,
      error: null
    };
  } catch (error) {
    return {
      script: helper.script,
      status: "not_ready",
      required: helper.required,
      missing: helper.required,
      error: String(error.stderr || error.message || error)
    };
  }
};

const renderMarkdown = (result) => {
  const rows = result.helpers
    .map((helper) => `| ${escapeCell(helper.script)} | ${helper.status} | ${escapeCell(helper.missing.length > 0 ? helper.missing.join(", ") : "none")} |`)
    .join("\n");
  const issues =
    result.helpers
      .filter((helper) => helper.status !== "ready")
      .map((helper) => `- ${helper.script}: missing ${helper.missing.join(", ")}${helper.error ? ` (${helper.error})` : ""}`)
      .join("\n") || "- None";

  return `### QA helper surface

| Metric | Value |
| --- | --- |
| Status | ${result.ready ? "ready" : "not ready"} |
| Helpers | ${result.helpers.length} |

| Helper | Status | Missing flags |
| --- | --- | --- |
${rows}

## QA Helper Surface Issues

${issues}
`;
};

const writeGitHubSummary = (markdown, args) => {
  if (!args.has("github-summary") || !process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown, "utf8");
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.has("help")) {
    printHelp();
    return;
  }

  const helperResults = helpers.map((helper) => checkHelper(helper));
  const result = {
    ready: helperResults.every((helper) => helper.status === "ready"),
    helpers: helperResults
  };
  const markdown = renderMarkdown(result);

  writeGitHubSummary(markdown, args);

  if (args.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(markdown);
  }

  if (!result.ready) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
