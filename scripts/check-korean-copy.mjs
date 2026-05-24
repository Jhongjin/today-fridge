import { readFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));

const printHelp = () => {
  console.log("Usage: node scripts/check-korean-copy.mjs [--json] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --json                        Print machine-readable JSON.");
  console.log("  --help                        Show this help.");
  console.log("");
  console.log("Checks required Korean listing, metadata, console asset, screenshot, and rating evidence copy.");
};

if (args.has("--help")) {
  printHelp();
  process.exit(0);
}

const checks = [
  {
    file: "docs/strategy/TOSS_LISTING_COPY.md",
    required: ["오늘의 냉장고", "오늘의 냉파 점수", "냉장고 속 재료를 톡톡 정리"]
  },
  {
    file: "docs/strategy/STRATEGY_LOCK.md",
    required: ["오늘의 냉장고", "오늘의 냉파 점수"]
  },
  {
    file: "index.html",
    required: ["<html lang=\"ko\">", "오늘의 냉장고", "냉장고 속 재료를 정리해"]
  },
  {
    file: "public/manifest.webmanifest",
    required: ["\"name\": \"오늘의 냉장고\"", "\"short_name\": \"오늘의 냉장고\"", "냉장고 속 재료를 정리해"]
  },
  {
    file: "scripts/capture-console-assets.mjs",
    required: ["오늘의 냉장고", "10초 냉파 퍼즐", "정리하고, 완성하고, 오늘 기록 경쟁"]
  },
  {
    file: "scripts/capture-submission-screenshots.mjs",
    required: ["오늘의 기록 제출"]
  },
  {
    file: "docs/platform/GAME_RATING_EVIDENCE.md",
    required: ["오늘의 냉장고", "등급분류", "게임물관리위원회"]
  }
];

const mojibakeMarkers = ["�", "?ㅻ", "罹", "怨?", "媛숈"];

const issues = [];
const fileResults = [];

for (const check of checks) {
  const text = readFileSync(check.file, "utf8");
  const fileIssues = [];

  for (const phrase of check.required) {
    if (!text.includes(phrase)) {
      const issue = `${check.file}: missing required phrase "${phrase}"`;
      issues.push(issue);
      fileIssues.push(issue);
    }
  }

  for (const marker of mojibakeMarkers) {
    if (text.includes(marker)) {
      const issue = `${check.file}: possible mojibake marker "${marker}"`;
      issues.push(issue);
      fileIssues.push(issue);
    }
  }

  fileResults.push({
    file: check.file,
    status: fileIssues.length === 0 ? "ready" : "not_ready",
    issues: fileIssues
  });
}

const ready = issues.length === 0;

if (args.has("--json")) {
  console.log(JSON.stringify({ ready, files: fileResults, issues }, null, 2));
} else if (!ready) {
  console.log("Korean copy check: not ready");
  console.log("");

  for (const issue of issues) {
    console.log(`- ${issue}`);
  }

} else {
  console.log("Korean copy check: ready");
  console.log("");
  console.log("| File | Status |");
  console.log("| --- | --- |");

  for (const result of fileResults) {
    console.log(`| ${result.file} | ${result.status} |`);
  }
}

if (!ready) {
  process.exitCode = 1;
}
