import { readFileSync } from "node:fs";

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
  }
];

const mojibakeMarkers = ["�", "?ㅻ", "罹", "怨?", "媛숈"];

const issues = [];

for (const check of checks) {
  const text = readFileSync(check.file, "utf8");

  for (const phrase of check.required) {
    if (!text.includes(phrase)) {
      issues.push(`${check.file}: missing required phrase "${phrase}"`);
    }
  }

  for (const marker of mojibakeMarkers) {
    if (text.includes(marker)) {
      issues.push(`${check.file}: possible mojibake marker "${marker}"`);
    }
  }
}

if (issues.length > 0) {
  console.log("Korean copy check: not ready");
  console.log("");

  for (const issue of issues) {
    console.log(`- ${issue}`);
  }

  process.exitCode = 1;
} else {
  console.log("Korean copy check: ready");
  console.log("");
  console.log("| File | Status |");
  console.log("| --- | --- |");

  for (const check of checks) {
    console.log(`| ${check.file} | ready |`);
  }
}
