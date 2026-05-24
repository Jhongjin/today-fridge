import { readdir, stat } from "node:fs/promises";
import { appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const distDir = join(process.cwd(), "dist");
const defaultBudgetBytes = 5 * 1024 * 1024;
const configuredBudget = process.env.BUNDLE_BUDGET_BYTES?.trim();
const budgetBytes = Number(configuredBudget ? configuredBudget : defaultBudgetBytes);

const printHelp = () => {
  console.log("Usage: node scripts/check-bundle-budget.mjs [--json] [--github-summary] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --github-summary              Write a Markdown summary for GitHub Actions.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Checks built dist size against BUNDLE_BUDGET_BYTES, defaulting to 5 MB, and fails on source maps.");
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const writeGitHubSummary = (result) => {
  if (!args.has("--github-summary") || !process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  const sourceMapText = result.sourceMaps?.length > 0 ? result.sourceMaps.join(", ") : "none";
  const issues = result.issues?.length > 0 ? result.issues.map((issue) => `- ${issue}`).join("\n") : "- None";
  const fileRows =
    result.files?.length > 0
      ? result.files
        .map((file) => `| ${escapeCell(file.path)} | ${formatBytes(file.bytes)} |`)
        .join("\n")
      : "| none |  |";

  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Bundle budget

| Metric | Value |
| --- | --- |
| Status | ${result.ready ? "ready" : "not ready"} |
| Total size | ${Number.isFinite(result.totalBytes) ? formatBytes(result.totalBytes) : "n/a"} |
| Budget | ${Number.isFinite(result.budgetBytes) ? formatBytes(result.budgetBytes) : "n/a"} |
| Over budget | ${Number.isFinite(result.overBudgetBytes) ? formatBytes(result.overBudgetBytes) : "n/a"} |
| Source maps | ${escapeCell(sourceMapText)} |

## Bundle Files

| File | Size |
| --- | ---: |
${fileRows}

## Bundle Issues

${issues}
`,
    "utf8"
  );
};

const printFailure = (message, extra = {}) => {
  const result = {
    ready: false,
    distDir,
    budgetBytes: Number.isFinite(budgetBytes) ? budgetBytes : null,
    issues: [message],
    ...extra
  };

  writeGitHubSummary(result);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error(message);
  }

  process.exit(1);
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return walk(path);
      }

      const file = await stat(path);
      return [
        {
          path,
          size: file.size
        }
      ];
    })
  );

  return files.flat();
};

if (args.has("--help")) {
  printHelp();
  process.exit(0);
}

if (!existsSync(distDir)) {
  printFailure("dist directory not found. Run npm run build before checking the bundle budget.");
}

if (!Number.isFinite(budgetBytes) || budgetBytes <= 0) {
  printFailure("BUNDLE_BUDGET_BYTES must be a positive number.");
}

const files = await walk(distDir);
const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
const sourceMaps = files.filter((file) => file.path.endsWith(".map"));
const overBudgetBytes = Math.max(0, totalBytes - budgetBytes);
const issues = [];

if (overBudgetBytes > 0) {
  issues.push(`Bundle budget exceeded by ${formatBytes(overBudgetBytes)}.`);
}

if (sourceMaps.length > 0) {
  issues.push(`Production build contains source maps: ${sourceMaps.map((file) => file.path).join(", ")}`);
}

const result = {
  ready: issues.length === 0,
  distDir,
  totalBytes,
  budgetBytes,
  overBudgetBytes,
  sourceMaps: sourceMaps.map((file) => file.path),
  files: files.map((file) => ({
    path: file.path,
    bytes: file.size,
    kilobytes: Number((file.size / 1024).toFixed(1))
  })),
  issues
};

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Bundle size: ${formatBytes(totalBytes)} / ${formatBytes(budgetBytes)} budget`);

  for (const issue of issues) {
    console.error(issue);
  }
}

writeGitHubSummary(result);

if (!result.ready) {
  process.exit(1);
}
