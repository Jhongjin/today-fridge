import { describe, expect, it } from "vitest";
import { grantTossPromotionRewardForGame, type AppsInTossPromotionRewardBridge } from "./tossPromotionRewardClient";

describe("Toss promotion reward client", () => {
  it("normalizes successful Toss promotion reward grants", async () => {
    const bridge: AppsInTossPromotionRewardBridge = async ({ params }) => ({
      key: `${params.promotionCode}:${params.amount}`
    });

    await expect(
      grantTossPromotionRewardForGame(
        {
          promotionCode: "ATTENDANCE_WEEK_1",
          amount: 20.8
        },
        bridge
      )
    ).resolves.toEqual({
      ok: true,
      key: "ATTENDANCE_WEEK_1:20"
    });
  });

  it("normalizes Toss promotion error and unsupported results", async () => {
    await expect(
      grantTossPromotionRewardForGame(
        {
          promotionCode: "ENDED_EVENT",
          amount: 20
        },
        async () => ({
          errorCode: "4105",
          message: "Promotion ended"
        })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "4105",
      message: "Promotion ended"
    });

    await expect(
      grantTossPromotionRewardForGame(
        {
          promotionCode: "OLD_VERSION",
          amount: 20
        },
        async () => undefined
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_VERSION_UNSUPPORTED"
    });
  });

  it("rejects unsafe local request shapes before calling Toss", async () => {
    await expect(
      grantTossPromotionRewardForGame(
        {
          promotionCode: " ",
          amount: 20
        },
        async () => ({ key: "unused" })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "PROMOTION_CODE_MISSING"
    });

    await expect(
      grantTossPromotionRewardForGame(
        {
          promotionCode: "ATTENDANCE_WEEK_1",
          amount: 0
        },
        async () => ({ key: "unused" })
      )
    ).resolves.toEqual({
      ok: false,
      errorCode: "PROMOTION_AMOUNT_INVALID"
    });
  });
});
