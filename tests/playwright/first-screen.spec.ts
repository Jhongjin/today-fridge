import { expect, test } from "@playwright/test";

const pageIssues = new WeakMap<object, string[]>();

test.beforeEach(async ({ page }) => {
  const issues: string[] = [];
  pageIssues.set(page, issues);

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    issues.push(error.message);
  });
});

test.afterEach(async ({ page }) => {
  expect(pageIssues.get(page) ?? []).toEqual([]);
});

test("first playable screen is visible and readable", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("오늘의 냉장고");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /냉장고 속 재료/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/icon.svg");
  const manifest = await page.evaluate(async () => (await fetch("/manifest.webmanifest")).json());
  expect(manifest.icons).toContainEqual(
    expect.objectContaining({
      src: "/icon.svg",
      type: "image/svg+xml"
    })
  );
  await expect(page.getByRole("heading", { name: "오늘의 김치볶음밥 냉파" })).toBeVisible();
  await expect(page.getByText("밥 + 김치 + 계란")).toBeVisible();
  await expect(page.getByTestId("fridge-board")).toBeVisible();
  await expect(page.getByTestId("prep-tray")).toBeVisible();
  await expect(page.getByTestId("daily-refresh-strip")).toBeVisible();
  await expect(page.getByTestId("daily-refresh-countdown")).toContainText(/후/);
  await expect(page.getByTestId("daily-streak")).toContainText(/연속 \d+일/);
  await expect(page.getByTestId("tutorial-strip")).toContainText("두부 3개");
  await expect(page.getByTestId("personal-best-value")).toHaveText("0");
  await expect(page.getByTestId("cell-tofu_1_fresh")).toHaveClass(/tile--highlighted/);
  await expect(page.getByTestId("cell-green_onion_1_fresh")).toBeVisible();
  await expect(page.getByTestId("cell-kimchi_5_expiring")).toBeVisible();
});

test("qa analytics panel shows live event history", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await expect(page.getByTestId("qa-analytics-panel")).toBeVisible();
  await expect(page.getByTestId("qa-event-list")).toContainText("app_open");
  await expect(page.getByTestId("qa-event-list")).toContainText("first_playable_ready");
  await expect(page.getByTestId("qa-event-list")).toContainText("round_start");

  await page.getByTestId("cell-green_onion_1_fresh").click();

  await expect(page.getByTestId("qa-event-list")).toContainText("move_commit");
});

test("qa analytics panel shows terminal mission summary", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await page.getByTestId("cell-tofu_1_fresh").click();
  await page.getByTestId("cell-tofu_2_fresh").click();
  await page.getByTestId("cell-tofu_4_expiring").click();
  await page.getByTestId("cell-rice_5_expiring").click();
  await page.getByTestId("cell-kimchi_5_expiring").click();
  await page.getByTestId("cell-egg_5_expiring").click();

  await expect(page.getByTestId("mission-summary-count")).toHaveText("3/3");
  await expect(page.getByTestId("qa-event-list")).toContainText("round_complete");
  await expect(page.getByTestId("qa-event-list")).toContainText("mission_summary");
});

test("recipe book opens from the first screen", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("recipe-book-open").click();

  await expect(page.getByTestId("recipe-book-panel")).toBeVisible();
  await expect(page.getByTestId("recipe-book-summary")).toContainText("0");
  await expect(page.getByTestId("recipe-book-card-kimchi_fried_rice")).toContainText("0/3");
  await page.getByRole("button", { name: "레시피북 닫기" }).click();
  await expect(page.getByTestId("recipe-book-panel")).toHaveCount(0);
});

test("player can clear three matching ingredients", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-green_onion_1_fresh").click();
  await page.getByTestId("cell-green_onion_2_fresh").click();
  await page.getByTestId("cell-green_onion_3_fresh").click();

  await expect(page.getByTestId("coach-message")).toContainText("깔끔하게 정리됐어요");
  await expect(page.getByTestId("score-value")).toHaveText("100");
});

test("player can complete the main recipe", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-rice_1_fresh").click();
  await page.getByTestId("cell-kimchi_1_fresh").click();
  await page.getByTestId("cell-egg_1_fresh").click();

  await expect(page.getByTestId("coach-message")).toContainText("김치볶음밥 완성");
  await expect(page.getByTestId("score-value")).toHaveText("500");
});

test("player can finish a clean board and submit the score", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-tofu_1_fresh").click();
  await page.getByTestId("cell-tofu_2_fresh").click();
  await page.getByTestId("cell-tofu_4_expiring").click();
  await expect(page.getByTestId("tutorial-strip")).toContainText("밥 + 김치 + 계란");
  await expect(page.getByTestId("cell-rice_5_expiring")).toHaveClass(/tile--highlighted/);
  await page.getByTestId("cell-rice_5_expiring").click();
  await page.getByTestId("cell-kimchi_5_expiring").click();
  await page.getByTestId("cell-egg_5_expiring").click();

  await expect(page.getByRole("heading", { name: "김치볶음밥 완성!" })).toBeVisible();
  const resultPanelBox = await page.locator(".result-panel").boundingBox();
  expect(resultPanelBox).not.toBeNull();
  expect(resultPanelBox!.y).toBeGreaterThanOrEqual(0);
  expect(resultPanelBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.getByTestId("tutorial-strip")).toHaveCount(0);
  await expect(page.getByTestId("score-value")).toHaveText("1,700");
  await expect(page.getByTestId("personal-best-value")).toHaveText("1,700");
  await expect(page.getByTestId("attempt-note")).toContainText("1번째");
  await expect(page.getByTestId("mission-summary-count")).toHaveText("3/3");
  await expect(page.getByTestId("mission-clean")).toHaveAttribute("aria-label", "클린 기록 완료");
  await expect(page.getByTestId("best-note")).toContainText("+1,700");
  await expect(page.getByTestId("best-route")).toContainText("6수");
  await expect(page.getByTestId("coin-balance")).toHaveText("0");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");
  await expect(page.getByTestId("recipe-piece-progress")).toHaveText("0/3");
  await page.getByTestId("reward-claim").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("30");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("1");
  await expect(page.getByTestId("recipe-piece-progress")).toHaveText("1/3");
  await expect(page.getByTestId("reward-claim")).toHaveText("참여 보상 받음");
  await page.getByTestId("result-share").click();
  await expect(page.getByTestId("result-share")).toContainText("결과 공유됨");
  await expect(page.getByRole("button", { name: "오늘의 기록 제출" })).toBeVisible();

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByRole("button", { name: "기록 제출 완료" })).toBeVisible();
  await page.getByTestId("leaderboard-open").click();
  await expect(page.getByTestId("leaderboard-open")).toHaveText("랭킹 열림");
});

test("qa Toss bridge path handles submit and leaderboard open", async ({ page }) => {
  await page.goto("/?qa=toss-bridge");

  await page.getByTestId("cell-tofu_1_fresh").click();
  await page.getByTestId("cell-tofu_2_fresh").click();
  await page.getByTestId("cell-tofu_4_expiring").click();
  await page.getByTestId("cell-rice_5_expiring").click();
  await page.getByTestId("cell-kimchi_5_expiring").click();
  await page.getByTestId("cell-egg_5_expiring").click();

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByRole("button", { name: "기록 제출 완료" })).toBeVisible();
  await page.getByTestId("leaderboard-open").click();
  await expect(page.getByTestId("leaderboard-open")).toHaveText("랭킹 열림");

  const bridgeEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(bridgeEvents).toEqual([
    {
      type: "submit",
      score: "1700"
    },
    {
      type: "open"
    }
  ]);
});

test("hint booster marks the run outside clean leaderboard", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "첫 판 힌트 닫기" }).click();
  await expect(page.getByTestId("tutorial-strip")).toHaveCount(0);

  await page.getByTestId("hint-booster").click();
  await expect(page.getByTestId("fairness-note")).toContainText("랭킹 제출 제외");
  await expect(page.getByTestId("cell-tofu_1_fresh")).toHaveClass(/tile--highlighted/);

  await page.getByTestId("cell-tofu_1_fresh").click();
  await page.getByTestId("cell-tofu_2_fresh").click();
  await page.getByTestId("cell-tofu_4_expiring").click();
  await page.getByTestId("cell-rice_5_expiring").click();
  await page.getByTestId("cell-kimchi_5_expiring").click();
  await page.getByTestId("cell-egg_5_expiring").click();

  await expect(page.getByRole("heading", { name: "김치볶음밥 완성!" })).toBeVisible();
  await expect(page.getByTestId("personal-best-value")).toHaveText("0");
  await expect(page.getByTestId("mission-summary-count")).toHaveText("2/3");
  await expect(page.getByTestId("mission-clean")).toHaveAttribute("aria-label", "클린 기록 미완료");

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByTestId("submit-note")).toContainText("clean ranked");
});

test("failed round can still claim a small participation coin reward", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-zucchini_1_fresh").click();
  await page.getByTestId("cell-soy_sauce_1_fresh").click();
  await page.getByTestId("cell-mushroom_2_fresh").click();
  await page.getByTestId("cell-green_onion_2_fresh").click();
  await page.getByTestId("cell-tofu_1_fresh").click();
  await page.getByTestId("cell-rice_1_fresh").click();

  await expect(page.getByRole("heading", { name: "한 수만 더 깔끔했어요" })).toBeVisible();
  await expect(page.getByTestId("coin-balance")).toHaveText("0");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");

  await page.getByTestId("failure-reward-claim").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("10");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");
  await expect(page.getByTestId("failure-reward-claim")).toHaveText("참여 코인 받음");
});
