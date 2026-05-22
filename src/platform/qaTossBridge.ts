import type { AppsInTossGameBridge } from "./appsInTossClient";
import { getRuntimeAppsInTossBridge } from "./runtimeTossClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";
const eventGlobalKey = "__TODAY_FRIDGE_TOSS_QA_EVENTS__";

export type QaTossBridgeEvent =
  | {
      type: "submit";
      score: string;
    }
  | {
      type: "open";
    };

type GlobalWithQaBridge = typeof globalThis & {
  [bridgeGlobalKey]?: AppsInTossGameBridge;
  [eventGlobalKey]?: QaTossBridgeEvent[];
};

const isQaTossBridgeEnabled = () => {
  const search = globalThis.location?.search;

  if (!search) {
    return false;
  }

  const params = new URLSearchParams(search);
  return params.get("qa") === "toss-bridge" || params.has("toss_bridge");
};

const pushQaEvent = (event: QaTossBridgeEvent) => {
  const qaGlobal = globalThis as GlobalWithQaBridge;
  qaGlobal[eventGlobalKey] = [...(qaGlobal[eventGlobalKey] ?? []), event];
};

export const installQaAppsInTossBridge = (): boolean => {
  if (!isQaTossBridgeEnabled() || getRuntimeAppsInTossBridge()) {
    return false;
  }

  (globalThis as GlobalWithQaBridge)[bridgeGlobalKey] = {
    isMinVersionSupported: () => true,
    async submitGameCenterLeaderBoardScore({ score }) {
      pushQaEvent({
        type: "submit",
        score
      });

      return { statusCode: "SUCCESS" };
    },
    async openGameCenterLeaderboard() {
      pushQaEvent({
        type: "open"
      });
    }
  };

  return true;
};
