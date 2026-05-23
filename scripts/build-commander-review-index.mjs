import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { checkCommanderReviewPacket } from "./check-commander-review-packet.mjs";

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

const checkedDecision = (text, options) => {
  for (const option of options) {
    const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^\\s*- \\[[xX]\\] ${escaped}$`, "m");

    if (pattern.test(text)) {
      return option;
    }
  }

  return "pending";
};

const commanderDecisionOf = (text) =>
  checkedDecision(sectionText(text, "Commander Decision"), [
    "Approved for next queue",
    "Approved with follow-up",
    "Blocked"
  ]);

const externalRewardDecisionOf = (text) => {
  const section = sectionText(text, "External Reward Approval");

  if (!section) {
    return "n/a";
  }

  return checkedDecision(section, [
    "Approved for next implementation queue",
    "Needs follow-up",
    "Rejected for now"
  ]);
};

const gameRatingEvidenceDecisionOf = (text) =>
  checkedDecision(sectionText(text, "Game Rating Evidence Approval"), [
    "Approved for Toss review request",
    "Needs rating evidence follow-up",
    "Blocked until rating evidence is complete"
  ]);

const productionMonitoringDecisionOf = (text) =>
  checkedDecision(sectionText(text, "Production Monitoring Approval"), [
    "Approved for production launch",
    "Explicitly deferred by commander",
    "Blocked until monitoring ownership is resolved"
  ]);

const summarizePacket = async (file) => {
  const text = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
  const check = checkCommanderReviewPacket(text);
  const missingRequiredCommands = check.issues
    .filter((issue) => issue.startsWith("Missing required command: "))
    .map((issue) => issue.replace("Missing required command: ", ""));

  return {
    file,
    status: check.ready ? "ready" : "not_ready",
    requiredCommands: missingRequiredCommands.length === 0 ? "ready" : `missing ${missingRequiredCommands.length}`,
    missingRequiredCommands,
    metadata: check.metadata,
    commanderDecision: commanderDecisionOf(text),
    gameRatingEvidenceDecision: gameRatingEvidenceDecisionOf(text),
    productionMonitoringDecision: productionMonitoringDecisionOf(text),
    externalRewardDecision: externalRewardDecisionOf(text),
    issues: check.issues
  };
};

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const renderMarkdown = ({ generatedAt, rows }) => {
  const readyRows = rows.filter((row) => row.status === "ready");
  const notReadyRows = rows.filter((row) => row.status !== "ready");

  return `# Commander Review Packet Index

Generated at: ${generatedAt}

## Summary

| Metric | Value |
| --- | --- |
| Packet files | ${rows.length} |
| Ready packets | ${readyRows.length} |
| Not-ready packets | ${notReadyRows.length} |

## Packets

| File | Commit | Worktree | Required Commands | Preview URL | External Rewards | Rating Evidence Decision | Monitoring Decision | Commander Decision | External Reward Decision | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.length > 0 ? rows.map((row) => {
    const metadata = row.metadata;

    return `| ${escapeCell(row.file)} | ${escapeCell(metadata.Commit)} | ${escapeCell(metadata["Working tree"])} | ${escapeCell(row.requiredCommands)} | ${escapeCell(metadata["Preview URL"])} | ${escapeCell(metadata["External reward review"])} | ${escapeCell(row.gameRatingEvidenceDecision)} | ${escapeCell(row.productionMonitoringDecision)} | ${escapeCell(row.commanderDecision)} | ${escapeCell(row.externalRewardDecision)} | ${row.status} |`;
  }).join("\n") : "| none |  |  |  |  |  |  |  |  |  | not_ready |"}

## Open Issues

${rows.length === 0 ? "- No commander review packet files found." : notReadyRows.length > 0 ? notReadyRows.map((row) => `### ${row.file}

${row.issues.map((issue) => `- ${issue}`).join("\n")}`).join("\n\n") : "- None"}
`;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const roots = args.positional.length > 0 ? args.positional : [args.values.dir ?? join("qa", "review-packets")];
  const files = [];

  for (const root of roots) {
    files.push(...(await listMarkdownFiles(root)));
  }

  const rows = [];

  for (const file of Array.from(new Set(files)).sort()) {
    rows.push(await summarizePacket(file));
  }

  const generatedAt = new Date().toISOString();
  const ready = rows.length > 0 && rows.every((row) => row.status === "ready");
  const result = {
    generatedAt,
    ready,
    packetCount: rows.length,
    rows
  };

  if (args.flags.has("json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const markdown = renderMarkdown({ generatedAt, rows });

    if (args.values.output) {
      await mkdir(dirname(args.values.output), { recursive: true });
      await writeFile(args.values.output, markdown, "utf8");
      console.log(`Commander review packet index written: ${args.values.output}`);
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
