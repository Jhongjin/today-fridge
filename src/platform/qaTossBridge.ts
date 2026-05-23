import type { AppsInTossGameBridge } from "./appsInTossClient";
import { getRuntimeAppsInTossBridge } from "./runtimeTossClient";

const bridgeGlobalKey = "__TODAY_FRIDGE_TOSS_BRIDGE__";
const eventGlobalKey = "__TODAY_FRIDGE_TOSS_QA_EVENTS__";

export type QaTossBridgeEvent =
  | {
      type: "submit";
      score: string;
      statusCode?: string;
    }
  | {
      type: "user-key";
      result: "HASH" | "UNAVAILABLE";
      hash?: string;
    }
  | {
      type: "open";
    };

type GlobalWithQaBridge = typeof globalThis & {
  [bridgeGlobalKey]?: AppsInTossGameBridge;
  [eventGlobalKey]?: QaTossBridgeEvent[];
};

const getQaTossBridgeMode = (): "success" | "submit-error" | "no-user-key" | null => {
  const search = globalThis.location?.search;

  if (!search) {
    return null;
  }

  const params = new URLSearchParams(search);
  const qaMode = params.get("qa");

  if (qaMode === "toss-bridge-error") {
    return "submit-error";
  }

  if (qaMode === "toss-bridge-no-user-key") {
    return "no-user-key";
  }

  if (qaMode === "toss-bridge" || params.has("toss_bridge")) {
    return "success";
  }

  return null;
};

const pushQaEvent = (event: QaTossBridgeEvent) => {
  const qaGlobal = globalThis as GlobalWithQaBridge;
  qaGlobal[eventGlobalKey] = [...(qaGlobal[eventGlobalKey] ?? []), event];
};

export const installQaAppsInTossBridge = (): boolean => {
  const mode = getQaTossBridgeMode();

  if (!mode || getRuntimeAppsInTossBridge()) {
    return false;
  }

  (globalThis as GlobalWithQaBridge)[bridgeGlobalKey] = {
    isMinVersionSupported: () => true,
    async getUserKeyForGame() {
      if (mode === "no-user-key") {
        pushQaEvent({
          type: "user-key",
          result: "UNAVAILABLE"
        });

        return undefined;
      }

      const hash = "qa-game-user-key";

      pushQaEvent({
        type: "user-key",
        result: "HASH",
        hash
      });

      return { type: "HASH", hash };
    },
    async submitGameCenterLeaderBoardScore({ score }) {
      const statusCode = mode === "submit-error" ? "QA_SUBMIT_FAILED" : undefined;

      pushQaEvent({
        type: "submit",
        score,
        ...(statusCode ? { statusCode } : {})
      });

      return { statusCode: statusCode ?? "SUCCESS" };
    },
    async openGameCenterLeaderboard() {
      pushQaEvent({
        type: "open"
      });
    }
  };

  return true;
};
