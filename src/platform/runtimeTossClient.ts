import { createAppsInTossClient, type AppsInTossGameBridge } from "./appsInTossClient";
import type { TossClient } from "./tossClient";
import { createTossMockClient } from "./tossMockClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";

type GlobalWithBridge = typeof globalThis & {
  [bridgeGlobalKey]?: AppsInTossGameBridge;
};

export const getRuntimeAppsInTossBridge = (): AppsInTossGameBridge | undefined =>
  (globalThis as GlobalWithBridge)[bridgeGlobalKey];

type TossClientLoader = () => Promise<TossClient>;

export type RuntimeTossClientOptions = {
  realClientEnabled?: boolean;
  loadRealClient?: TossClientLoader;
};

export const isRealTossClientEnabled = (): boolean => import.meta.env.VITE_TOSS_REAL_CLIENT === "true";

const loadOfficialTossClient: TossClientLoader = async () => {
  const { createTossRealClient } = await import("./tossRealClient");

  return createTossRealClient();
};

const createDeferredTossClient = (loadRealClient: TossClientLoader): TossClient => {
  let clientPromise: Promise<TossClient> | undefined;

  const getClient = () => {
    clientPromise =
      clientPromise ??
      loadRealClient().catch((error: unknown) => {
        clientPromise = undefined;
        throw error;
      });

    return clientPromise;
  };

  return {
    async getUserKey() {
      try {
        return await (await getClient()).getUserKey();
      } catch {
        return undefined;
      }
    },
    async submitLeaderboardScore(score, playId) {
      try {
        return await (await getClient()).submitLeaderboardScore(score, playId);
      } catch {
        return { ok: false, errorCode: "TOSS_SDK_UNAVAILABLE" };
      }
    },
    async openLeaderboard() {
      await (await getClient()).openLeaderboard();
    }
  };
};

export const createRuntimeTossClient = (options: RuntimeTossClientOptions = {}): TossClient => {
  const bridge = getRuntimeAppsInTossBridge();

  if (bridge) {
    return createAppsInTossClient(bridge);
  }

  if (options.realClientEnabled ?? isRealTossClientEnabled()) {
    return createDeferredTossClient(options.loadRealClient ?? loadOfficialTossClient);
  }

  return createTossMockClient();
};
