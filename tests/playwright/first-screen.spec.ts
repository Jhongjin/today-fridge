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
  await expect(page.getByLabel("냉장고 보드")).toBeVisible();
  await expect(page.getByLabel("준비대")).toBeVisible();
  await expect(page.getByRole("button", { name: "대파" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "김치 임박" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("player can clear three matching ingredients", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "대파" }).nth(0).click();
  await page.getByRole("button", { name: "대파" }).nth(1).click();
  await page.getByRole("button", { name: "대파" }).nth(0).click();

  await expect(page.getByText("깔끔하게 정리됐어요. 이어서 콤보를 노려보세요.")).toBeVisible();
  await expect(page.getByText("100")).toBeVisible();
});

test("player can complete the main recipe", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "밥" }).nth(0).click();
  await page.getByRole("button", { name: "김치" }).nth(0).click();
  await page.getByRole("button", { name: "계란" }).nth(0).click();

  await expect(page.getByText("김치볶음밥 완성! 임박 재료까지 챙기면 점수가 더 올라요.")).toBeVisible();
  await expect(page.getByText("500")).toBeVisible();
});

