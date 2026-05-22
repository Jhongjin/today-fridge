import { expect, test } from "@playwright/test";

test("first playable screen is visible and readable", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "오늘의 김치볶음밥 냉파" })).toBeVisible();
  await expect(page.getByText("밥 + 김치 + 계란")).toBeVisible();
  await expect(page.getByTestId("fridge-board")).toBeVisible();
  await expect(page.getByTestId("prep-tray")).toBeVisible();
  await expect(page.getByTestId("tutorial-strip")).toContainText("두부 3개");
  await expect(page.getByTestId("personal-best-value")).toHaveText("0");
  await expect(page.getByTestId("cell-tofu_1_fresh")).toHaveClass(/tile--highlighted/);
  await expect(page.getByTestId("cell-green_onion_1_fresh")).toBeVisible();
  await expect(page.getByTestId("cell-kimchi_5_expiring")).toBeVisible();
  expect(consoleErrors).toEqual([]);
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
  await expect(page.getByTestId("tutorial-strip")).toHaveCount(0);
  await expect(page.getByTestId("score-value")).toHaveText("1,700");
  await expect(page.getByTestId("personal-best-value")).toHaveText("1,700");
  await expect(page.getByTestId("best-note")).toContainText("+1,700");
  await expect(page.getByTestId("coin-balance")).toHaveText("0");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");
  await page.getByTestId("reward-claim").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("30");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("1");
  await expect(page.getByTestId("reward-claim")).toHaveText("참여 보상 받음");
  await expect(page.getByRole("button", { name: "오늘의 기록 제출" })).toBeVisible();

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByRole("button", { name: "기록 제출 완료" })).toBeVisible();
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
