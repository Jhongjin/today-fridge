import { readdir, readFile, stat } from "node:fs/promises";
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

const countMatches = (text, pattern) => Array.from(text.matchAll(pattern)).length;

const hasSection = (text, heading) => new RegExp(`^## ${heading}$`, "m").test(text);

const hasCheckedDecision = (text) =>
  /^- \[[xX]\] (Pass|Pass with follow-up|Fail)$/m.test(text);

const hasExternalRewardCandidate = (text) =>
  /^\| External reward candidate \| yes \|$/m.test(text);

const findBlankArtifactRows = (text) =>
  Array.from(text.matchAll(/^\| ([^|\n]+) \| {0,1} \|$/gm)).map((match) => match[1].trim());

const validateSession = (file, text) => {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const issues = [];
  const requiredSections = [
    "Metadata",
    "Version Gates",
    "Entry And Shell",
    "User Key",
    "Game Flow",
    "Game Center",
    "Observability",
    "Evidence",
    "Commander Decision"
  ];

  for (const section of requiredSections) {
    if (!hasSection(normalizedText, section)) {
      issues.push(`Missing section: ${section}`);
    }
  }

  const externalRewardCandidate = hasExternalRewardCandidate(normalizedText);

  if (externalRewardCandidate) {
    for (const section of ["External Reward Runtime", "External Reward Checks", "External Reward Evidence"]) {
      if (!hasSection(normalizedText, section)) {
        issues.push(`Missing external reward section: ${section}`);
      }
    }
  }

  const todoCount = countMatches(normalizedText, /\bTODO\b/g);

  if (todoCount > 0) {
    issues.push(`Unresolved TODO markers: ${todoCount}`);
  }

  const blankArtifactRows = findBlankArtifactRows(normalizedText);

  if (blankArtifactRows.length > 0) {
    issues.push(`Blank artifact locations: ${blankArtifactRows.join(", ")}`);
  }

  if (!hasCheckedDecision(normalizedText)) {
    issues.push("Commander decision is not checked");
  }

  return {
    file,
    externalRewardCandidate,
    status: issues.length === 0 ? "ready" : "not_ready",
    issues
  };
};

const printTable = (rows) => {
  console.log("| File | Status | Issues |");
  console.log("| --- | --- | --- |");

  for (const row of rows) {
    console.log(`| ${row.file} | ${row.status} | ${row.issues.length > 0 ? row.issues.join("; ") : "none"} |`);
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const roots = args.positional.length > 0 ? args.positional : [args.values.dir ?? join("qa", "qr-sessions")];
  const files = [];

  for (const root of roots) {
    files.push(...(await listMarkdownFiles(root)));
  }

  const uniqueFiles = Array.from(new Set(files)).sort();
  const rows = [];

  for (const file of uniqueFiles) {
    rows.push(validateSession(file, await readFile(file, "utf8")));
  }

  const ready = rows.length > 0 && rows.every((row) => row.status === "ready");
  const result = {
    ready,
    sessionCount: rows.length,
    rows,
    issues: rows.length === 0 ? ["No QR session Markdown files found."] : []
  };

  if (args.flags.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`QR session evidence: ${ready ? "ready" : "not ready"}`);

    if (rows.length === 0) {
      console.log("");
      console.log("No QR session Markdown files found.");
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
