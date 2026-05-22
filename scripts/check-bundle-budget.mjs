import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const defaultBudgetBytes = 5 * 1024 * 1024;
const configuredBudget = process.env.BUNDLE_BUDGET_BYTES?.trim();
const budgetBytes = Number(configuredBudget ? configuredBudget : defaultBudgetBytes);

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return walk(path);
      }

      const file = await stat(path);
      return file.size;
    })
  );

  return sizes.reduce((sum, size) => sum + size, 0);
};

if (!existsSync(distDir)) {
  console.error("dist directory not found. Run npm run build before checking the bundle budget.");
  process.exit(1);
}

if (!Number.isFinite(budgetBytes) || budgetBytes <= 0) {
  console.error("BUNDLE_BUDGET_BYTES must be a positive number.");
  process.exit(1);
}

const totalBytes = await walk(distDir);
console.log(`Bundle size: ${formatBytes(totalBytes)} / ${formatBytes(budgetBytes)} budget`);

if (totalBytes > budgetBytes) {
  console.error(`Bundle budget exceeded by ${formatBytes(totalBytes - budgetBytes)}.`);
  process.exit(1);
}
