import type { Page } from "@playwright/test";

export const CLEAN_ROUTE = [
  "cell-tofu_1_fresh",
  "cell-tofu_2_fresh",
  "cell-tofu_4_expiring",
  "cell-rice_5_expiring",
  "cell-kimchi_5_expiring",
  "cell-egg_5_expiring"
] as const;

export const FAILED_PARTICIPATION_ROUTE = [
  "cell-zucchini_1_fresh",
  "cell-soy_sauce_1_fresh",
  "cell-mushroom_2_fresh",
  "cell-green_onion_2_fresh",
  "cell-tofu_1_fresh",
  "cell-rice_1_fresh"
] as const;

export async function playRoute(page: Page, cellTestIds: readonly string[]) {
  for (const cellTestId of cellTestIds) {
    await page.getByTestId(cellTestId).click();
  }
}

export async function playCleanRoute(page: Page) {
  await playRoute(page, CLEAN_ROUTE);
}

export async function playFailedParticipationRoute(page: Page) {
  await playRoute(page, FAILED_PARTICIPATION_ROUTE);
}
