import { appendFile, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const parseArgs = (argv) => {
  const args = {
    flags: new Set(),
    values: {},
    positional: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith("--")) {
      args.positional.push(item);
      continue;
    }

    const raw = item.slice(2);
    const equalsIndex = raw.indexOf("=");

    if (equalsIndex >= 0) {
      args.values[raw.slice(0, equalsIndex)] = raw.slice(equalsIndex + 1);
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args.flags.add(raw);
      continue;
    }

    args.values[raw] = next;
    index += 1;
  }

  return args;
};

const listMarkdownFiles = async (root) => {
  const files = [];

  try {
    const rootStat = await stat(root);

    if (rootStat.isFile()) {
      return root.endsWith(".md") ? [root] : [];
    }
  } catch {
    return [];
  }

  const visit = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path);
      }
    }
  };

  await visit(root);
  return files;
};

const sectionText = (text, heading) => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`## ${escaped}\\s+([\\s\\S]*?)(?=\\n## |\\s*$)`));

  return match?.[1] ?? "";
};

const hasSection = (text, heading) => new RegExp(`^## ${heading}$`, "m").test(text);

const checkboxLabel = (line) => line.replace(/^\s*- \[[ xX]\]\s*/, "").trim();

const checkedBoxes = (text) => text.match(/^\s*- \[[xX]\].*$/gm) ?? [];
const uncheckedBoxes = (text) => text.match(/^\s*- \[ \].*$/gm) ?? [];

const checkedOptions = (text, labels) => checkedBoxes(text).filter((line) => labels.includes(checkboxLabel(line)));

const parseMetadata = (text) => {
  const metadata = new Map();
  const table = sectionText(text, "Metadata");

  for (const line of table.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    const value = match[2].trim();

    if (key !== "Field" && !key.startsWith("---")) {
      metadata.set(key, value);
    }
  }

  return metadata;
};

const requiredSections = [
  "Metadata",
  "Selected Evidence Path",
  "Store Self-Rating Evidence",
  "GRAC Certificate Evidence",
  "Gameplay Screenshots",
  "Content Guardrails",
  "Commander Rating Decision"
];

const evidencePathLabels = ["Store self-rating evidence is selected.", "GRAC certificate evidence is selected."];
const decisionLabels = [
  "Approved for Toss review request",
  "Needs rating evidence follow-up",
  "Blocked until rating evidence is complete"
];

const validateEvidence = (file, text) => {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const issues = [];

  for (const section of requiredSections) {
    if (!hasSection(normalizedText, section)) {
      issues.push(`Missing section: ${section}`);
    }
  }

  const metadata = parseMetadata(normalizedText);
  const metadataPath = metadata.get("Evidence path") ?? "";
  const pathChecked = checkedOptions(sectionText(normalizedText, "Selected Evidence Path"), evidencePathLabels);

  if (!metadataPath || metadataPath === "pending") {
    issues.push("Evidence path metadata must be filled.");
  }

  if (pathChecked.length !== 1) {
    issues.push("Selected Evidence Path must have exactly one checked evidence path.");
  } else if (metadataPath && !pathChecked[0].toLowerCase().includes(metadataPath.toLowerCase())) {
    issues.push(`Metadata evidence path ${metadataPath} does not match checked path ${checkboxLabel(pathChecked[0])}.`);
  }

  const decisionChecked = checkedOptions(sectionText(normalizedText, "Commander Rating Decision"), decisionLabels);
  if (decisionChecked.length !== 1) {
    issues.push("Commander Rating Decision must have exactly one checked decision.");
  }

  const allowedUncheckedLabels = new Set([...evidencePathLabels, ...decisionLabels]);
  const uncheckedRequiredBoxes = uncheckedBoxes(normalizedText).filter((line) => !allowedUncheckedLabels.has(checkboxLabel(line)));

  if (uncheckedRequiredBoxes.length > 0) {
    issues.push(`Evidence still has ${uncheckedRequiredBoxes.length} unchecked checklist item(s).`);
  }

  if (/\bTODO\b/i.test(normalizedText)) {
    issues.push("Evidence still contains TODO.");
  }

  return {
    file,
    status: issues.length === 0 ? "ready" : "not_ready",
    evidencePath: metadataPath || "missing",
    decision: decisionChecked.length === 1 ? checkboxLabel(decisionChecked[0]) : "pending",
    issues
  };
};

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const writeGitHubSummary = async (result, args) => {
  if (!args.flags.has("github-summary") || !process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  const rows =
    result.rows.length > 0
      ? result.rows
        .map((row) => `| ${escapeCell(row.file)} | ${escapeCell(row.evidencePath)} | ${escapeCell(row.decision)} | ${row.status} | ${escapeCell(row.issues.length > 0 ? row.issues.join("; ") : "none")} |`)
        .join("\n")
      : "| none |  |  | not_ready | No game rating evidence files found. |";
  const issues =
    result.rows.length === 0
      ? "- No game rating evidence files found."
      : result.rows
        .flatMap((row) => row.issues.map((issue) => `- ${row.file}: ${issue}`))
        .join("\n") || "- None";

  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `### Game rating evidence check

| Metric | Value |
| --- | --- |
| Status | ${result.ready ? "ready" : "not ready"} |
| Evidence files | ${result.evidenceCount} |

| File | Evidence path | Decision | Status | Issues |
| --- | --- | --- | --- | --- |
${rows}

## Game Rating Evidence Issues

${issues}
`,
    "utf8"
  );
};

const printTable = (rows) => {
  console.log("| File | Evidence path | Decision | Status | Issues |");
  console.log("| --- | --- | --- | --- | --- |");

  for (const row of rows) {
    console.log(`| ${row.file} | ${row.evidencePath} | ${row.decision} | ${row.status} | ${row.issues.length > 0 ? row.issues.join("; ") : "none"} |`);
  }
};

const printHelp = () => {
  console.log("Usage: node scripts/check-game-rating-evidence.mjs [paths...] [--dir <dir>] [--json] [--github-summary] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --dir <dir>                   Directory to scan when no paths are provided. Defaults to qa/rating-evidence.");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --github-summary              Write a Markdown summary for GitHub Actions.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Pass Markdown files or directories as positional paths to validate a focused rating evidence set.");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has("help")) {
    printHelp();
    return;
  }

  const roots = args.positional.length > 0 ? args.positional : [args.values.dir ?? join("qa", "rating-evidence")];
  const files = [];

  for (const root of roots) {
    files.push(...(await listMarkdownFiles(root)));
  }

  const rows = [];

  for (const file of Array.from(new Set(files)).sort()) {
    rows.push(validateEvidence(file, await readFile(file, "utf8")));
  }

  const ready = rows.length > 0 && rows.every((row) => row.status === "ready");
  const result = {
    ready,
    evidenceCount: rows.length,
    rows,
    issues: rows.length === 0 ? ["No game rating evidence files found."] : []
  };

  await writeGitHubSummary(result, args);

  if (args.flags.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Game rating evidence: ${ready ? "ready" : "not ready"}`);

    if (rows.length === 0) {
      console.log("");
      console.log("No game rating evidence files found.");
    } else {
      console.log("");
      printTable(rows);
    }
  }

  if (!ready) {
    process.exitCode = 1;
  }
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
