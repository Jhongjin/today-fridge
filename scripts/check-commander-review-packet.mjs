import { readFileSync, statSync } from "node:fs";
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
  "Real Device QR Approval",
  "Preview Deploy Approval",
  "Toss Console Setup Approval",
  "SDK Dependency Approval",
  "Game Rating Evidence Approval",
  "Production Monitoring Approval",
  "Platform Decision",
  "Commander Decision"
];

const requiredCommands = [
  "npm run qa:qr-session:check",
  "npm run qa:qr-session:index -- --strict",
  "npm run qa:korean-copy",
  "npm run qa:console-assets",
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
  "Approved for Toss review request",
  "Needs rating evidence follow-up",
  "Blocked until rating evidence is complete",
  "Approved for production launch",
  "Explicitly deferred by commander",
  "Blocked until monitoring ownership is resolved",
  "Approved with documented SDK risk",
  "Needs SDK dependency follow-up",
  "Blocked until SDK dependency risk is resolved",
  "Approved for Toss console setup",
  "Needs console setup follow-up",
  "Blocked until console setup is complete",
  "Needs QR follow-up",
  "Blocked until QR evidence is complete",
  "Approved with preview URL",
  "Approved with preview deploy skipped",
  "Blocked until preview deploy is ready",
  "Needs follow-up",
  "Rejected for now"
]);

const checkboxLabel = (line) => line.replace(/^\s*- \[[ xX]\]\s*/, "").trim();

const isDecisionOption = (line) => decisionLabels.has(checkboxLabel(line));

const checkedDecisionOptions = (text) =>
  checkedBoxes(text).filter((line) => decisionLabels.has(checkboxLabel(line)));

const commitsMatch = (actual, expected) => {
  const normalizedActual = actual.trim().toLowerCase();
  const normalizedExpected = expected.trim().toLowerCase();

  return (
    normalizedActual.length > 0 &&
    normalizedExpected.length > 0 &&
    (normalizedActual === normalizedExpected ||
      normalizedActual.startsWith(normalizedExpected) ||
      normalizedExpected.startsWith(normalizedActual))
  );
};

const isGitHubActionsRunUrl = (value) =>
  /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/actions\/runs\/\d+(?:[/?#][^\s]*)?$/.test(value.trim());

const isHttpsUrl = (value) => /^https:\/\/[^\s]+$/.test(value.trim());

const isExistingFile = (value) => {
  try {
    return statSync(value.trim()).isFile();
  } catch {
    return false;
  }
};

export const checkCommanderReviewPacket = (text, options = {}) => {
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
  const actionsRunUrl = metadata.get("Queue Preview run") ?? "";
  const previewUrl = metadata.get("Preview URL") ?? "";
  const qrSessionIndex = metadata.get("QR session index") ?? "";
  const worktree = metadata.get("Working tree") ?? "";

  if (!commit || commit === "main" || commit === "pending") {
    issues.push("Commit metadata must be a reviewed commit SHA, not main or pending.");
  }

  const expectedCommit = typeof options.expectedCommit === "string" ? options.expectedCommit : "";
  if (expectedCommit && !commitsMatch(commit, expectedCommit)) {
    issues.push(`Commit metadata ${commit} does not match expected commit ${expectedCommit}.`);
  }

  if (!actionsRunUrl || actionsRunUrl === "pending") {
    issues.push("Queue Preview run metadata must be filled.");
  } else if (!isGitHubActionsRunUrl(actionsRunUrl)) {
    issues.push("Queue Preview run metadata must be a GitHub Actions run URL.");
  }

  if (!previewUrl || previewUrl === "pending") {
    issues.push("Preview URL metadata must be filled.");
  } else if (!isHttpsUrl(previewUrl)) {
    issues.push("Preview URL metadata must be an HTTPS URL.");
  }

  if (!qrSessionIndex || qrSessionIndex === "pending") {
    issues.push("QR session index metadata must be filled.");
  } else if (!isHttpsUrl(qrSessionIndex) && !isExistingFile(qrSessionIndex)) {
    issues.push("QR session index metadata must be an HTTPS URL or an existing local file.");
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

  const qrDecisionChecked = checkedDecisionOptions(sectionText(text, "Real Device QR Approval"));
  if (qrDecisionChecked.length !== 1) {
    issues.push("Real device QR decision must have exactly one checked decision.");
  }

  const previewDeployDecisionChecked = checkedDecisionOptions(sectionText(text, "Preview Deploy Approval"));
  if (previewDeployDecisionChecked.length !== 1) {
    issues.push("Preview deploy decision must have exactly one checked decision.");
  }

  const consoleSetupDecisionChecked = checkedDecisionOptions(sectionText(text, "Toss Console Setup Approval"));
  if (consoleSetupDecisionChecked.length !== 1) {
    issues.push("Toss console setup decision must have exactly one checked decision.");
  }

  const ratingEvidenceDecisionChecked = checkedDecisionOptions(sectionText(text, "Game Rating Evidence Approval"));
  if (ratingEvidenceDecisionChecked.length !== 1) {
    issues.push("Game rating evidence decision must have exactly one checked decision.");
  }

  const sdkDependencyDecisionChecked = checkedDecisionOptions(sectionText(text, "SDK Dependency Approval"));
  if (sdkDependencyDecisionChecked.length !== 1) {
    issues.push("SDK dependency decision must have exactly one checked decision.");
  }

  const monitoringDecisionChecked = checkedDecisionOptions(sectionText(text, "Production Monitoring Approval"));
  if (monitoringDecisionChecked.length !== 1) {
    issues.push("Production monitoring decision must have exactly one checked decision.");
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
  console.log("Usage: node scripts/check-commander-review-packet.mjs <packet.md> [--expected-commit <sha>] [--json]");
  console.log("       node scripts/check-commander-review-packet.mjs --stdin [--expected-commit <sha>] [--json]");
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
  const result = checkCommanderReviewPacket(packet.text, {
    expectedCommit: typeof args["expected-commit"] === "string" ? args["expected-commit"] : ""
  });

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
