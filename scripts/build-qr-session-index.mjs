import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

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

const sectionBody = (text, heading) => {
  const match = text.match(new RegExp(`(?:^|\\n)## ${heading}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1] ?? "";
};

const metadataOf = (text) => {
  const metadata = {};
  const metadataSection = sectionBody(text, "Metadata");

  for (const match of metadataSection.matchAll(/^\| ([^|\n]+) \| ([^|\n]*) \|$/gm)) {
    const key = match[1].trim();
    const value = match[2].trim();

    if (key !== "Field" && !key.startsWith("---")) {
      metadata[key] = value;
    }
  }

  return metadata;
};

const hasSection = (text, heading) => new RegExp(`^## ${heading}$`, "m").test(text);

const hasCheckedDecision = (text) =>
  /^- \[[xX]\] (Pass|Pass with follow-up|Fail)$/m.test(text);

const decisionOf = (text) => text.match(/^- \[[xX]\] (Pass|Pass with follow-up|Fail)$/m)?.[1] ?? "pending";

const hasExternalRewardCandidate = (text) =>
  /^\| External reward candidate \| yes \|$/m.test(text);

const findBlankArtifactRows = (text) =>
  Array.from(text.matchAll(/^\| ([^|\n]+) \| {0,1} \|$/gm)).map((match) => match[1].trim());

const validateSession = (text) => {
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
    if (!hasSection(text, section)) {
      issues.push(`Missing section: ${section}`);
    }
  }

  if (hasExternalRewardCandidate(text)) {
    for (const section of ["External Reward Runtime", "External Reward Checks", "External Reward Evidence"]) {
      if (!hasSection(text, section)) {
        issues.push(`Missing external reward section: ${section}`);
      }
    }
  }

  const todoCount = Array.from(text.matchAll(/\bTODO\b/g)).length;

  if (todoCount > 0) {
    issues.push(`Unresolved TODO markers: ${todoCount}`);
  }

  const blankArtifactRows = findBlankArtifactRows(text);

  if (blankArtifactRows.length > 0) {
    issues.push(`Blank artifact locations: ${blankArtifactRows.join(", ")}`);
  }

  if (!hasCheckedDecision(text)) {
    issues.push("Commander decision is not checked");
  }

  return issues;
};

const summarizeSession = async (file) => {
  const text = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
  const metadata = metadataOf(text);
  const issues = validateSession(text);

  return {
    file,
    metadata,
    status: issues.length === 0 ? "ready" : "not_ready",
    decision: decisionOf(text),
    externalRewardCandidate: metadata["External reward candidate"] === "yes",
    issues
  };
};

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const renderMarkdown = ({ generatedAt, rows }) => {
  const readyCount = rows.filter((row) => row.status === "ready").length;
  const externalRewardCount = rows.filter((row) => row.externalRewardCandidate).length;
  const notReadyRows = rows.filter((row) => row.status !== "ready");

  return `# QR Session Index

Generated at: ${generatedAt}

## Summary

| Metric | Value |
| --- | --- |
| Session files | ${rows.length} |
| Ready sessions | ${readyCount} |
| Not-ready sessions | ${notReadyRows.length} |
| External reward sessions | ${externalRewardCount} |

## Sessions

| File | Platform | Mode | Device | Toss Version | Commit | External Rewards | Decision | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.length > 0 ? rows.map((row) => {
    const metadata = row.metadata;

    return `| ${escapeCell(row.file)} | ${escapeCell(metadata.Platform)} | ${escapeCell(metadata.Mode)} | ${escapeCell(metadata.Device)} | ${escapeCell(metadata["Toss app version"])} | ${escapeCell(metadata.Commit)} | ${row.externalRewardCandidate ? "yes" : "no"} | ${escapeCell(row.decision)} | ${row.status} |`;
  }).join("\n") : "| none |  |  |  |  |  |  |  | not_ready |"}

## Open Issues

${rows.length === 0 ? "- No session files found." : notReadyRows.length > 0 ? notReadyRows.map((row) => `### ${row.file}

${row.issues.map((issue) => `- ${issue}`).join("\n")}`).join("\n\n") : "- None"}
`;
};

const printHelp = () => {
  console.log("Usage: node scripts/build-qr-session-index.mjs [paths...] [--dir <dir>] [--output <path>] [--json] [--strict] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --dir <dir>                   Directory to scan when no paths are provided. Defaults to qa/qr-sessions.");
  console.log("  --output <path>               Write the Markdown index to a file instead of stdout.");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --strict                      Exit non-zero unless at least one session exists and every session is ready.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Pass Markdown files or directories as positional paths to index a focused session set.");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has("help")) {
    printHelp();
    return;
  }

  const roots = args.positional.length > 0 ? args.positional : [args.values.dir ?? join("qa", "qr-sessions")];
  const files = [];

  for (const root of roots) {
    files.push(...(await listMarkdownFiles(root)));
  }

  const rows = [];

  for (const file of Array.from(new Set(files)).sort()) {
    rows.push(await summarizeSession(file));
  }

  const generatedAt = new Date().toISOString();
  const ready = rows.length > 0 && rows.every((row) => row.status === "ready");
  const result = {
    generatedAt,
    ready,
    sessionCount: rows.length,
    rows
  };

  if (args.flags.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const markdown = renderMarkdown({ generatedAt, rows });

    if (args.values.output) {
      await mkdir(dirname(args.values.output), { recursive: true });
      await writeFile(args.values.output, markdown, "utf8");
      console.log(`QR session index written: ${args.values.output}`);
    } else {
      process.stdout.write(markdown);
    }
  }

  if (args.flags.has("strict") && !ready) {
    process.exitCode = 1;
  }
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
