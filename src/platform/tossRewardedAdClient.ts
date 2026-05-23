import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import type { RewardedAdClient, RewardedAdClientResult, RewardedAdPlacement, RewardedAdShowResult } from "./rewardedAd";

type Cleanup = () => void;

type LoadEvent = {
  type: "loaded";
};

type ShowEvent =
  | { type: "requested" }
  | { type: "show" }
  | { type: "impression" }
  | { type: "clicked" }
  | { type: "dismissed" }
  | { type: "failedToShow" }
  | { type: "userEarnedReward"; data?: { unitType: string; unitAmount: number } };

export type AppsInTossAdBridge = {
  loadFullScreenAd: ((args: {
    options?: { adGroupId: string };
    onEvent: (event: LoadEvent) => void;
    onError: (error: Error) => void;
  }) => Cleanup) & {
    isSupported?: () => boolean;
  };
  showFullScreenAd: ((args: {
    options?: { adGroupId: string };
    onEvent: (event: ShowEvent) => void;
    onError: (error: Error) => void;
  }) => Cleanup) & {
    isSupported?: () => boolean;
  };
};

export type TossRewardedAdClientOptions = {
  adGroupIdByPlacement: Record<RewardedAdPlacement, string>;
  timeoutMs?: number;
};

const officialAdBridge: AppsInTossAdBridge = {
  loadFullScreenAd,
  showFullScreenAd
};

const normalizeError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const resolveWithTimeout = <Result>(
  timeoutMs: number,
  run: (resolve: (result: Result) => void) => Cleanup | undefined,
  onTimeout: () => Result
): Promise<Result> =>
  new Promise((resolve) => {
    let settled = false;
    let cleanup: Cleanup | undefined;
    const finish = (result: Result) => {
      if (settled) {
        return;
      }

      settled = true;
      globalThis.clearTimeout(timer);
      cleanup?.();
      resolve(result);
    };
    const timer = globalThis.setTimeout(() => finish(onTimeout()), timeoutMs);

    try {
      cleanup = run(finish);
      if (settled) {
        cleanup?.();
      }
    } catch {
      finish(onTimeout());
    }
  });

export const createTossRewardedAdClient = (
  { adGroupIdByPlacement, timeoutMs = 8000 }: TossRewardedAdClientOptions,
  bridge: AppsInTossAdBridge = officialAdBridge
): RewardedAdClient => ({
  async load(placement): Promise<RewardedAdClientResult> {
    const adGroupId = adGroupIdByPlacement[placement];

    if (!adGroupId) {
      return { ok: false, errorCode: "TOSS_AD_GROUP_ID_MISSING" };
    }

    if (bridge.loadFullScreenAd.isSupported?.() === false) {
      return { ok: false, errorCode: "TOSS_AD_UNSUPPORTED" };
    }

    return resolveWithTimeout<RewardedAdClientResult>(
      timeoutMs,
      (resolve) =>
        bridge.loadFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            if (event.type === "loaded") {
              resolve({ ok: true });
            }
          },
          onError: (error) => resolve({ ok: false, errorCode: normalizeError(error, "TOSS_AD_LOAD_FAILED") })
        }),
      () => ({ ok: false, errorCode: "TOSS_AD_LOAD_TIMEOUT" })
    );
  },

  async show(placement): Promise<RewardedAdShowResult> {
    const adGroupId = adGroupIdByPlacement[placement];

    if (!adGroupId) {
      return { completed: false, errorCode: "TOSS_AD_GROUP_ID_MISSING" };
    }

    if (bridge.showFullScreenAd.isSupported?.() === false) {
      return { completed: false, errorCode: "TOSS_AD_UNSUPPORTED" };
    }

    return resolveWithTimeout<RewardedAdShowResult>(
      timeoutMs,
      (resolve) =>
        bridge.showFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            if (event.type === "userEarnedReward") {
              resolve({ completed: true });
            }

            if (event.type === "dismissed") {
              resolve({ completed: false, errorCode: "TOSS_AD_DISMISSED" });
            }

            if (event.type === "failedToShow") {
              resolve({ completed: false, errorCode: "TOSS_AD_SHOW_FAILED" });
            }
          },
          onError: (error) => resolve({ completed: false, errorCode: normalizeError(error, "TOSS_AD_SHOW_FAILED") })
        }),
      () => ({ completed: false, errorCode: "TOSS_AD_SHOW_TIMEOUT" })
    );
  }
});
