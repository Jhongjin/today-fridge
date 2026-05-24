import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const distDir = join(process.cwd(), "dist");
const defaultBudgetBytes = 5 * 1024 * 1024;
const configuredBudget = process.env.BUNDLE_BUDGET_BYTES?.trim();
const budgetBytes = Number(configuredBudget ? configuredBudget : defaultBudgetBytes);

const printHelp = () => {
  console.log("Usage: node scripts/check-bundle-budget.mjs [--json] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Checks built dist size against BUNDLE_BUDGET_BYTES, defaulting to 5 MB, and fails on source maps.");
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const printFailure = (message, extra = {}) => {
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          ready: false,
          distDir,
          budgetBytes: Number.isFinite(budgetBytes) ? budgetBytes : null,
          issues: [message],
          ...extra
        },
        null,
        2
      )
    );
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

if (!result.ready) {
  process.exit(1);
}
