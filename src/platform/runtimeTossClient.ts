import { createAppsInTossClient, type AppsInTossGameBridge } from "./appsInTossClient";
import type { TossClient } from "./tossClient";
import { createTossMockClient } from "./tossMockClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";

type GlobalWithBridge = typeof globalThis & {
  [bridgeGlobalKey]?: AppsInTossGameBridge;
};

export const getRuntimeAppsInTossBridge = (): AppsInTossGameBridge | undefined =>
  (globalThis as GlobalWithBridge)[bridgeGlobalKey];

export const createRuntimeTossClient = (): TossClient => {
  const bridge = getRuntimeAppsInTossBridge();

  if (bridge) {
    return createAppsInTossClient(bridge);
  }

  return createTossMockClient();
};
