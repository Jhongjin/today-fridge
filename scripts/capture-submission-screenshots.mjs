import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const host = "127.0.0.1";
const port = "5174";
const baseURL = `http://${host}:${port}`;
const outputDir = join("qa", "artifacts", "submission-screenshots");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const waitForServer = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120_000) {
    try {
      const response = await fetch(baseURL);

      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting until Vite is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseURL}`);
};

const clickCleanRoute = async (page) => {
  for (const testId of [
    "cell-tofu_1_fresh",
    "cell-tofu_2_fresh",
    "cell-tofu_4_expiring",
    "cell-rice_5_expiring",
    "cell-kimchi_5_expiring",
    "cell-egg_5_expiring"
  ]) {
    await page.getByTestId(testId).click();
  }
};

const capture = async (page, fileName) => {
  await page.screenshot({
    path: join(outputDir, fileName),
    fullPage: true
  });
};

const server = spawn(npmCommand, ["run", "dev", "--", "--host", host, "--port", port], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

try {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await waitForServer();

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await page.goto(baseURL);
  await capture(page, "01-first-playable.png");

  await page.getByTestId("recipe-book-open").click();
  await capture(page, "02-recipe-book.png");
  await page.locator(".recipe-book-panel .icon-button").click();

  await clickCleanRoute(page);
  await page.getByTestId("best-route").waitFor();
  await capture(page, "03-completion-result.png");

  await page.getByTestId("reward-claim").click();
  await capture(page, "04-reward-claimed.png");

  const hintPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await hintPage.goto(baseURL);
  await hintPage.getByTestId("tutorial-strip").locator("button").click();
  await hintPage.getByTestId("hint-booster").click();
  await capture(hintPage, "05-hint-fairness.png");

  const bridgePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await bridgePage.goto(`${baseURL}/?qa=toss-bridge`);
  await clickCleanRoute(bridgePage);
  await bridgePage.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await bridgePage.getByTestId("leaderboard-open").click();
  await capture(bridgePage, "06-qa-toss-bridge.png");

  await browser.close();
  console.log(`Saved submission screenshots to ${outputDir}`);
} finally {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore"
    });
  } else {
    server.kill("SIGTERM");
  }
}
