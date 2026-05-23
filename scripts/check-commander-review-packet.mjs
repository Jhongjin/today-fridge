import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const parseArgs = (argv) => {
  const args = {
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
      args[raw.slice(0, equalsIndex)] = raw.slice(equalsIndex + 1);
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[raw] = true;
      continue;
    }

    args[raw] = next;
    index += 1;
  }

  return args;
};

const readPacket = (args) => {
  const file = typeof args.file === "string" ? args.file : args.positional[0];

  if (args.stdin || file === "-") {
    return {
      label: "stdin",
      text: readFileSync(0, "utf8")
    };
  }

  if (!file) {
    throw new Error("Missing commander review packet path. Pass a file path or --stdin.");
  }

  return {
    label: file,
    text: readFileSync(file, "utf8")
  };
};

const requiredSections = [
  "Metadata",
  "Required Local Commands",
  "Evidence Checklist",
  "Platform Decision",
  "Commander Decision"
];

const requiredCommands = [
  "npm run qa:qr-session:check",
  "npm run qa:qr-session:index -- --strict",
  "npm run sdk:dependency-triage -- --strict",
  "npm run deploy:check-prereqs"
];

const parseMetadata = (text) => {
  const metadata = new Map();
  const metadataMatch = text.match(/## Metadata\s+([\s\S]*?)(?=\n## |\s*$)/);
  const table = metadataMatch?.[1] ?? "";

  for (const line of table.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    const value = match[2].trim();

    if (key === "Field" || key.startsWith("---")) {
      continue;
    }

    metadata.set(key, value);
  }

  return metadata;
};

const sectionText = (text, heading) => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`## ${escaped}\\s+([\\s\\S]*?)(?=\\n## |\\s*$)`));

  return match?.[1] ?? "";
};

const checkedBoxes = (text) => text.match(/^\s*- \[[xX]\].*$/gm) ?? [];
const uncheckedBoxes = (text) => text.match(/^\s*- \[ \].*$/gm) ?? [];

const decisionLabels = new Set([
  "Approved for next implementation queue",
  "Approved for next queue",
  "Approved with follow-up",
  "Blocked",
  "Needs follow-up",
  "Rejected for now"
]);

const checkboxLabel = (line) => line.replace(/^\s*- \[[ xX]\]\s*/, "").trim();

const isDecisionOption = (line) => decisionLabels.has(checkboxLabel(line));

const checkedDecisionOptions = (text) =>
  checkedBoxes(text).filter((line) => decisionLabels.has(checkboxLabel(line)));

export const checkCommanderReviewPacket = (text) => {
  const issues = [];

  for (const section of requiredSections) {
    if (!text.includes(`## ${section}`)) {
      issues.push(`Missing section: ${section}`);
    }
  }

  for (const command of requiredCommands) {
    if (!text.includes(command)) {
      issues.push(`Missing required command: ${command}`);
    }
  }

  const metadata = parseMetadata(text);
  const commit = metadata.get("Commit") ?? "";
  const previewUrl = metadata.get("Preview URL") ?? "";
  const qrSessionIndex = metadata.get("QR session index") ?? "";
  const worktree = metadata.get("Working tree") ?? "";

  if (!commit || commit === "main" || commit === "pending") {
    issues.push("Commit metadata must be a reviewed commit SHA, not main or pending.");
  }

  if (!previewUrl || previewUrl === "pending") {
    issues.push("Preview URL metadata must be filled.");
  }

  if (!qrSessionIndex || qrSessionIndex === "pending") {
    issues.push("QR session index metadata must be filled.");
  }

  if (worktree !== "clean") {
    issues.push("Working tree metadata must be clean.");
  }

  if (/\bTODO\b/i.test(text)) {
    issues.push("Packet still contains TODO.");
  }

  const unchecked = uncheckedBoxes(text).filter((line) => !isDecisionOption(line));
  if (unchecked.length > 0) {
    issues.push(`Packet still has ${unchecked.length} unchecked checkbox(es).`);
  }

  const commanderDecisionChecked = checkedDecisionOptions(sectionText(text, "Commander Decision"));
  if (commanderDecisionChecked.length !== 1) {
    issues.push("Commander Decision must have exactly one checked decision.");
  }

  const externalRewardSection = sectionText(text, "External Reward Approval");
  if (externalRewardSection.length > 0) {
    const externalRewardDecisionChecked = checkedDecisionOptions(externalRewardSection);

    if (externalRewardDecisionChecked.length !== 1) {
      issues.push("External reward decision must have exactly one checked decision.");
    }
  }

  return {
    ready: issues.length === 0,
    issues,
    metadata: Object.fromEntries(metadata)
  };
};

const printHelp = () => {
  console.log("Usage: node scripts/check-commander-review-packet.mjs <packet.md> [--json]");
  console.log("       node scripts/check-commander-review-packet.mjs --stdin [--json]");
  console.log("");
  console.log("Fails when a commander review packet still has TODOs, unchecked boxes, missing metadata, or no selected decision.");
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const packet = readPacket(args);
  const result = checkCommanderReviewPacket(packet.text);

  if (args.json) {
    console.log(JSON.stringify({ ...result, source: packet.label }, null, 2));
  } else {
    console.log(`Commander review packet: ${result.ready ? "ready" : "not ready"}`);
    console.log(`Source: ${packet.label}`);

    if (result.issues.length > 0) {
      console.log("");
      console.log("Issues:");

      for (const issue of result.issues) {
        console.log(`- ${issue}`);
      }
    }
  }

  if (!result.ready) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
