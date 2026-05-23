import { describe, expect, it, vi } from "vitest";
import { createRuntimeExternalRewardClients, type RuntimeExternalRewardClientOptions } from "./runtimeExternalRewardClients";

const completeEnv: RuntimeExternalRewardClientOptions["env"] = {
  VITE_TOSS_REAL_CLIENT: "true",
  VITE_TOSS_REAL_EXTERNAL_REWARDS: "true",
  VITE_TOSS_CONTACTS_VIRAL_MODULE_ID: "contacts-module",
  VITE_TOSS_REWARDED_AD_RESULT_FAILURE_ID: "ad-failure",
  VITE_TOSS_REWARDED_AD_RESULT_COMPLETION_ID: "ad-completion",
  VITE_TOSS_REWARDED_AD_RECIPE_BOOK_ID: "ad-recipe",
  VITE_TOSS_PROMOTION_CODE: "ATTENDANCE_WEEK_1"
};

describe("runtime external reward clients", () => {
  it("keeps mock clients when real external rewards are not requested", async () => {
    const loadRealExternalRewards = vi.fn();
    const clients = await createRuntimeExternalRewardClients({
      env: {
        ...completeEnv,
        VITE_TOSS_REAL_EXTERNAL_REWARDS: "false"
      },
      loadRealExternalRewards
    });

    expect(clients.gate.mode).toBe("mock");
    await expect(clients.rewardedAdClient.load("result_failure")).resolves.toEqual({ ok: true });
    expect(clients.contactsViralClient).toBeUndefined();
    expect(clients.grantPromotionRewardForGame).toBeUndefined();
    expect(loadRealExternalRewards).not.toHaveBeenCalled();
  });

  it("fails closed with mock clients when the real reward gate is blocked", async () => {
    const loadRealExternalRewards = vi.fn();
    const clients = await createRuntimeExternalRewardClients({
      env: {
        ...completeEnv,
        VITE_TOSS_REAL_CLIENT: "false"
      },
      loadRealExternalRewards
    });

    expect(clients.gate.mode).toBe("blocked");
    expect(clients.gate.blockedReason).toBe("REAL_TOSS_CLIENT_REQUIRED");
    await expect(clients.rewardedAdClient.show("result_failure")).resolves.toEqual({ completed: true });
    expect(loadRealExternalRewards).not.toHaveBeenCalled();
  });

  it("loads real external reward clients only when the gate is open", async () => {
    const contactsViralClient = {
      open: vi.fn().mockResolvedValue({ ok: true, rewardAmount: 12, rewardUnit: "fridge_coin" })
    };
    const rewardedAdClient = {
      load: vi.fn().mockResolvedValue({ ok: true }),
      show: vi.fn().mockResolvedValue({ completed: true })
    };
    const grantTossPromotionRewardForGame = vi.fn().mockResolvedValue({ ok: true, key: "reward-key" });
    const createTossRewardedAdClient = vi.fn().mockReturnValue(rewardedAdClient);
    const clients = await createRuntimeExternalRewardClients({
      env: completeEnv,
      loadRealExternalRewards: vi.fn().mockResolvedValue({
        createTossContactsViralClient: vi.fn().mockReturnValue(contactsViralClient),
        createTossRewardedAdClient,
        grantTossPromotionRewardForGame
      })
    });

    expect(clients.gate.mode).toBe("real");
    expect(clients.contactsViralClient).toBe(contactsViralClient);
    expect(clients.rewardedAdClient).toBe(rewardedAdClient);
    expect(createTossRewardedAdClient).toHaveBeenCalledWith({
      adGroupIdByPlacement: {
        result_failure: "ad-failure",
        result_completion: "ad-completion",
        recipe_book: "ad-recipe"
      }
    });
    await expect(clients.grantPromotionRewardForGame?.(20)).resolves.toEqual({ ok: true, key: "reward-key" });
    expect(grantTossPromotionRewardForGame).toHaveBeenCalledWith({
      promotionCode: "ATTENDANCE_WEEK_1",
      amount: 20
    });
  });
});
