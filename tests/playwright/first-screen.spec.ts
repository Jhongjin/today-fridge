import { expect, test } from "@playwright/test";
import { CLEAN_ROUTE, playCleanRoute, playFailedParticipationRoute, playRoute } from "./helpers/gameplay";

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
  await expect(page.getByTestId("recipe-dock")).toContainText("레시피북");
  await expect(page.getByTestId("hero-recipe-piece-progress")).toHaveText("0/3");
  await expect(page.locator('[data-testid="recipe-dock"] .recipe-dock__icons i')).toHaveCount(3);
  await expect(page.getByTestId("tutorial-strip")).toContainText("두부 3개");
  await expect(page.getByTestId("personal-best-value")).toHaveText("0");
  await expect(page.getByTestId("best-chase-label")).toHaveText("첫 기록 도전");
  await expect(page.getByTestId("best-chase-value")).toHaveText("완주하면 저장");
  await expect(page.getByTestId("profile-gate")).toContainText("토스 게임 프로필 확인 완료");
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
  await expect(page.getByTestId("qa-event-list")).toContainText("game_user_key_result");
  await expect(page.getByTestId("qa-event-list")).toContainText("profile_gate_result");
  await expect(page.getByTestId("qa-event-list")).toContainText("result:mock");

  await page.getByTestId("cell-green_onion_1_fresh").click();

  await expect(page.getByTestId("qa-event-list")).toContainText("move_commit");
});

test("qa analytics panel shows terminal mission summary", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await playCleanRoute(page);

  await expect(page.getByTestId("mission-summary-count")).toHaveText("3/3");
  await expect(page.getByTestId("qa-event-list")).toContainText("round_complete");
  await expect(page.getByTestId("qa-event-list")).toContainText("score_tier:S");
  await expect(page.getByTestId("qa-event-list")).toContainText("mission_summary");
});

test("qa analytics panel shows leaderboard score audit receipt", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await playCleanRoute(page);
  await page.getByTestId("leaderboard-submit").click();

  await expect(page.getByTestId("qa-event-list")).toContainText("leaderboard_submit");
  await expect(page.getByTestId("qa-event-list")).toContainText("route_cells:E1>B3>C6>E5>A6>B6");
  await expect(page.getByTestId("qa-event-list")).toContainText("score_breakdown_receipt:clearPoints:100");
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

test("quiet and reduced-motion controls persist after reload", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await page.getByTestId("mute-button").click();
  await page.getByTestId("reduce-motion-button").click();

  await expect(page.getByTestId("mute-button")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("reduce-motion-button")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("qa-event-list")).toContainText("setting_toggle");
  await expect(page.getByTestId("qa-event-list")).toContainText("setting_id:mute");
  await expect(page.getByTestId("qa-event-list")).toContainText("setting_id:reduce_motion");

  await page.reload();

  await expect(page.getByTestId("mute-button")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("reduce-motion-button")).toHaveAttribute("aria-pressed", "true");
});

test("player can clear three matching ingredients", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-green_onion_1_fresh").click();
  await page.getByTestId("cell-green_onion_2_fresh").click();
  await page.getByTestId("cell-green_onion_3_fresh").click();

  await expect(page.getByTestId("coach-message")).toContainText("깔끔하게 정리됐어요");
  await expect(page.getByTestId("score-value")).toHaveText("100");
});

test("pause button holds board interaction until resumed", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await page.getByTestId("pause-button").click();

  await expect(page.getByTestId("pause-button")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("pause-panel")).toBeVisible();
  await expect(page.getByTestId("cell-green_onion_1_fresh")).toBeDisabled();
  await expect(page.getByTestId("hint-booster")).toBeDisabled();
  await expect(page.getByTestId("score-value")).toHaveText("0");
  await expect(page.getByTestId("qa-event-list")).toContainText("game_pause");
  await expect(page.getByTestId("qa-event-list")).toContainText("active_duration_ms:");

  await page.getByTestId("resume-button").click();

  await expect(page.getByTestId("pause-panel")).toHaveCount(0);
  await expect(page.getByTestId("pause-button")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("cell-green_onion_1_fresh")).toBeEnabled();
  await expect(page.getByTestId("qa-event-list")).toContainText("game_resume");
  await expect(page.getByTestId("qa-event-list")).toContainText("paused_ms:");

  await page.getByTestId("cell-green_onion_1_fresh").click();
  await page.getByTestId("cell-green_onion_2_fresh").click();
  await page.getByTestId("cell-green_onion_3_fresh").click();

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

test("personal best chase updates after replay starts", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await playCleanRoute(page);
  await page.getByTestId("restart-button").click();

  await expect(page.getByTestId("personal-best-value")).toHaveText("1,700");
  await expect(page.getByTestId("best-chase-label")).toHaveText("최고까지");
  await expect(page.getByTestId("best-chase-value")).toHaveText("1,700점");
  await expect(page.getByTestId("best-route-strip")).toContainText("1,700점 · 6수");

  await page.getByTestId("cell-green_onion_1_fresh").click();
  await page.getByTestId("cell-green_onion_2_fresh").click();
  await page.getByTestId("cell-green_onion_3_fresh").click();

  await expect(page.getByTestId("score-value")).toHaveText("100");
  await expect(page.getByTestId("best-chase-value")).toHaveText("1,600점");
  await expect(page.getByTestId("best-route-strip-label")).toContainText("새 루트 실험 중");
  await expect(page.getByTestId("qa-event-list")).toContainText("best_route_deviation");
  await expect(page.getByTestId("qa-event-list")).toContainText("matched_steps:0");
});

test("player can finish a clean board and submit the score", async ({ page }) => {
  await page.goto("/");

  await playRoute(page, CLEAN_ROUTE.slice(0, 3));
  await expect(page.getByTestId("tutorial-strip")).toContainText("밥 + 김치 + 계란");
  await expect(page.getByTestId("cell-rice_5_expiring")).toHaveClass(/tile--highlighted/);
  await playRoute(page, CLEAN_ROUTE.slice(3));

  await expect(page.getByRole("heading", { name: "김치볶음밥 완성!" })).toBeVisible();
  const resultPanelBox = await page.locator(".result-panel").boundingBox();
  expect(resultPanelBox).not.toBeNull();
  expect(resultPanelBox!.y).toBeGreaterThanOrEqual(0);
  expect(resultPanelBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect(page.getByTestId("tutorial-strip")).toHaveCount(0);
  await expect(page.getByTestId("score-value")).toHaveText("1,700");
  await expect(page.getByTestId("score-tier")).toContainText("S");
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

test("friend challenge grants a fixed share reward once without changing ranked score", async ({ page }) => {
  await page.goto("/?qa=analytics");

  await playCleanRoute(page);

  await expect(page.getByTestId("score-value")).toHaveText("1,700");
  await expect(page.getByTestId("coin-balance")).toHaveText("0");

  await page.getByTestId("friend-challenge").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("12");
  await expect(page.getByTestId("score-value")).toHaveText("1,700");
  await expect(page.getByTestId("qa-event-list")).toContainText("share_reward_event");
  await expect(page.getByTestId("qa-event-list")).toContainText("friend_challenge_send");
  await expect(page.getByTestId("qa-event-list")).toContainText("status:rewarded");

  await page.getByTestId("friend-challenge").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("12");
  await expect(page.getByTestId("qa-event-list")).toContainText("status:shared");

  await page.getByTestId("leaderboard-submit").click();
  await expect(page.getByTestId("leaderboard-submit")).toBeDisabled();
});

test("qa Toss bridge path handles submit and leaderboard open", async ({ page }) => {
  await page.goto("/?qa=toss-bridge");

  await playCleanRoute(page);

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByRole("button", { name: "기록 제출 완료" })).toBeVisible();
  await page.getByTestId("leaderboard-open").click();
  await expect(page.getByTestId("leaderboard-open")).toHaveText("랭킹 열림");

  const bridgeEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(bridgeEvents).toContainEqual({
    type: "user-key",
    result: "HASH",
    hash: "qa-game-user-key"
  });
  expect(bridgeEvents?.filter((event) => event.type === "submit" || event.type === "open")).toEqual([
    {
      type: "submit",
      score: "1700"
    },
    {
      type: "open"
    }
  ]);
});

test("qa Toss bridge keeps leaderboard open separate from one clean submit", async ({ page }) => {
  await page.goto("/?qa=toss-bridge");

  await playCleanRoute(page);

  const beforeSubmitEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(beforeSubmitEvents?.filter((event) => event.type === "submit" || event.type === "open")).toEqual([]);

  await page.getByTestId("leaderboard-submit").click();
  await expect(page.getByTestId("leaderboard-submit")).toBeDisabled();

  const afterSubmitEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(afterSubmitEvents?.filter((event) => event.type === "submit" || event.type === "open")).toEqual([
    {
      type: "submit",
      score: "1700"
    }
  ]);

  await page.getByTestId("leaderboard-open").click();
  await expect(page.getByTestId("leaderboard-open")).toHaveText("랭킹 열림");

  const afterOpenEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(afterOpenEvents?.filter((event) => event.type === "submit" || event.type === "open")).toEqual([
    {
      type: "submit",
      score: "1700"
    },
    {
      type: "open"
    }
  ]);
});

test("qa Toss bridge submit failure leaves the player recoverable", async ({ page }) => {
  await page.goto("/?qa=toss-bridge-error");

  await playCleanRoute(page);
  await page.getByTestId("leaderboard-submit").click();

  await expect(page.getByTestId("submit-note")).toContainText("다시 시도");
  await expect(page.getByTestId("leaderboard-submit")).toBeEnabled();
  await page.getByTestId("leaderboard-submit").click();

  const bridgeEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(bridgeEvents).toContainEqual({
    type: "user-key",
    result: "HASH",
    hash: "qa-game-user-key"
  });
  expect(bridgeEvents?.filter((event) => event.type === "submit")).toEqual([
    {
      type: "submit",
      score: "1700",
      statusCode: "QA_SUBMIT_FAILED"
    },
    {
      type: "submit",
      score: "1700",
      statusCode: "QA_SUBMIT_FAILED"
    }
  ]);
});

test("qa Toss bridge profile gate blocks ranked play without a game user key", async ({ page }) => {
  await page.goto("/?qa=toss-bridge-no-user-key");

  await expect(page.getByTestId("profile-gate")).toContainText("프로필 확인 필요");
  await expect(page.getByTestId("cell-green_onion_1_fresh")).toBeDisabled();
  await expect(page.getByTestId("hint-booster")).toBeDisabled();
  await expect(page.getByTestId("pause-button")).toBeDisabled();
  await expect(page.getByTestId("score-value")).toHaveText("0");

  const bridgeEvents = await page.evaluate(() => window.__TODAY_FRIDGE_TOSS_QA_EVENTS__);
  expect(bridgeEvents).toContainEqual({
    type: "user-key",
    result: "UNAVAILABLE"
  });
  expect(bridgeEvents?.filter((event) => event.type === "submit")).toEqual([]);
});

test("hint booster marks the run outside clean leaderboard", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "첫 판 힌트 닫기" }).click();
  await expect(page.getByTestId("tutorial-strip")).toHaveCount(0);

  await page.getByTestId("hint-booster").click();
  await expect(page.getByTestId("fairness-note")).toContainText("랭킹 제출 제외");
  await expect(page.getByTestId("cell-tofu_1_fresh")).toHaveClass(/tile--highlighted/);

  await playCleanRoute(page);

  await expect(page.getByRole("heading", { name: "김치볶음밥 완성!" })).toBeVisible();
  await expect(page.getByTestId("score-tier")).toContainText("연습");
  await expect(page.getByTestId("personal-best-value")).toHaveText("0");
  await expect(page.getByTestId("mission-summary-count")).toHaveText("2/3");
  await expect(page.getByTestId("mission-clean")).toHaveAttribute("aria-label", "클린 기록 미완료");

  await page.getByRole("button", { name: "오늘의 기록 제출" }).click();
  await expect(page.getByTestId("submit-note")).toContainText("clean ranked");
});

test("failed round can still claim a small participation coin reward", async ({ page }) => {
  await page.goto("/");

  await playFailedParticipationRoute(page);

  await expect(page.getByRole("heading", { name: "한 수만 더 깔끔했어요" })).toBeVisible();
  await expect(page.getByTestId("score-tier")).toContainText("아쉬움");
  await expect(page.getByTestId("coin-balance")).toHaveText("0");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");

  await page.getByTestId("failure-reward-claim").click();
  await expect(page.getByTestId("coin-balance")).toHaveText("10");
  await expect(page.getByTestId("recipe-piece-balance")).toHaveText("0");
  await expect(page.getByTestId("failure-reward-claim")).toHaveText("참여 코인 받음");
});
