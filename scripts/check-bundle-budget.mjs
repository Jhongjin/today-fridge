import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const distDir = join(process.cwd(), "dist");
const defaultBudgetBytes = 5 * 1024 * 1024;
const configuredBudget = process.env.BUNDLE_BUDGET_BYTES?.trim();
const budgetBytes = Number(configuredBudget ? configuredBudget : defaultBudgetBytes);

const printHelp = () => {
  console.log("Usage: node scripts/check-bundle-budget.mjs [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Checks built dist size against BUNDLE_BUDGET_BYTES, defaulting to 5 MB, and fails on source maps.");
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

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
  console.error("dist directory not found. Run npm run build before checking the bundle budget.");
  process.exit(1);
}

if (!Number.isFinite(budgetBytes) || budgetBytes <= 0) {
  console.error("BUNDLE_BUDGET_BYTES must be a positive number.");
  process.exit(1);
}

const files = await walk(distDir);
const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
const sourceMaps = files.filter((file) => file.path.endsWith(".map"));
console.log(`Bundle size: ${formatBytes(totalBytes)} / ${formatBytes(budgetBytes)} budget`);

if (totalBytes > budgetBytes) {
  console.error(`Bundle budget exceeded by ${formatBytes(totalBytes - budgetBytes)}.`);
  process.exit(1);
}

if (sourceMaps.length > 0) {
  console.error(`Production build contains source maps: ${sourceMaps.map((file) => file.path).join(", ")}`);
  process.exit(1);
}
