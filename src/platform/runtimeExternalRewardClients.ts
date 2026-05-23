import { getExternalRewardRuntimeGate, type ExternalRewardRuntimeEnv, type ExternalRewardRuntimeGate } from "./externalRewardRuntimeGate";
import { createMockRewardedAdClient, type RewardedAdClient, type RewardedAdPlacement } from "./rewardedAd";
import type { ContactsViralClient } from "./tossContactsViralClient";
import type { TossPromotionRewardGrantResult } from "./tossPromotionRewardClient";

type RealExternalRewardModules = {
  createTossContactsViralClient: () => ContactsViralClient;
  createTossRewardedAdClient: (options: {
    adGroupIdByPlacement: Record<RewardedAdPlacement, string>;
  }) => RewardedAdClient;
  grantTossPromotionRewardForGame: (
    request: {
      promotionCode: string;
      amount: number;
    }
  ) => Promise<TossPromotionRewardGrantResult>;
};

export type RuntimeExternalRewardClients = {
  gate: ExternalRewardRuntimeGate;
  contactsViralClient?: ContactsViralClient;
  rewardedAdClient: RewardedAdClient;
  grantPromotionRewardForGame?: (amount: number) => Promise<TossPromotionRewardGrantResult>;
};

export type RuntimeExternalRewardClientOptions = {
  env?: ExternalRewardRuntimeEnv;
  loadRealExternalRewards?: () => Promise<RealExternalRewardModules>;
};

const loadOfficialExternalRewards = async (): Promise<RealExternalRewardModules> => {
  const [{ createTossContactsViralClient }, { createTossRewardedAdClient }, { grantTossPromotionRewardForGame }] =
    await Promise.all([
      import("./tossContactsViralClient"),
      import("./tossRewardedAdClient"),
      import("./tossPromotionRewardClient")
    ]);

  return {
    createTossContactsViralClient,
    createTossRewardedAdClient,
    grantTossPromotionRewardForGame
  };
};

export const createRuntimeExternalRewardClients = async ({
  env,
  loadRealExternalRewards = loadOfficialExternalRewards
}: RuntimeExternalRewardClientOptions = {}): Promise<RuntimeExternalRewardClients> => {
  const gate = getExternalRewardRuntimeGate(env);

  if (!gate.canUseRealExternalRewards) {
    return {
      gate,
      rewardedAdClient: createMockRewardedAdClient()
    };
  }

  const modules = await loadRealExternalRewards();
  const contactsViralModuleId = gate.contactsViralModuleId;
  const promotionCode = gate.promotionCode;
  const adGroupIdByPlacement = gate.rewardedAdGroupIds;

  if (
    !contactsViralModuleId ||
    !promotionCode ||
    !adGroupIdByPlacement.result_failure ||
    !adGroupIdByPlacement.result_completion ||
    !adGroupIdByPlacement.recipe_book
  ) {
    return {
      gate: {
        ...gate,
        mode: "blocked",
        canUseRealExternalRewards: false,
        blockedReason: "EXTERNAL_REWARD_ENV_MISSING"
      },
      rewardedAdClient: createMockRewardedAdClient()
    };
  }

  return {
    gate,
    contactsViralClient: modules.createTossContactsViralClient(),
    rewardedAdClient: modules.createTossRewardedAdClient({
      adGroupIdByPlacement: {
        result_failure: adGroupIdByPlacement.result_failure,
        result_completion: adGroupIdByPlacement.result_completion,
        recipe_book: adGroupIdByPlacement.recipe_book
      }
    }),
    grantPromotionRewardForGame: (amount) =>
      modules.grantTossPromotionRewardForGame({
        promotionCode,
        amount
      })
  };
};
