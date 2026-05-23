import type { LeaderboardSubmitResult, TossClient } from "./tossClient";

type SubmitGameCenterLeaderBoardScoreResponse = {
  statusCode?: string;
};

type GetUserKeyForGameSuccessResponse = {
  type: "HASH";
  hash: string;
};

type GetUserKeyForGameResponse = GetUserKeyForGameSuccessResponse | "INVALID_CATEGORY" | "ERROR" | undefined;

type TossVersionValue = `${number}.${number}.${number}` | "always" | "never";

type TossMinVersion = {
  android: TossVersionValue;
  ios: TossVersionValue;
};

export type AppsInTossGameBridge = {
  isMinVersionSupported?: (params: TossMinVersion) => boolean;
  getUserKeyForGame?: () => Promise<GetUserKeyForGameResponse>;
  submitGameCenterLeaderBoardScore?: (params: { score: string }) => Promise<SubmitGameCenterLeaderBoardScoreResponse | undefined>;
  openGameCenterLeaderboard?: () => Promise<void | undefined> | void;
};

export const TOSS_GAME_CENTER_MIN_VERSION = {
  android: "5.221.0",
  ios: "5.221.0"
} as const;

export const TOSS_GAME_USER_KEY_MIN_VERSION = {
  android: "5.232.0",
  ios: "5.232.0"
} as const;

const isSupported = (bridge: AppsInTossGameBridge, minVersion: TossMinVersion = TOSS_GAME_CENTER_MIN_VERSION): boolean =>
  bridge.isMinVersionSupported ? bridge.isMinVersionSupported(minVersion) : true;

const normalizeScore = (score: number): string => String(Math.max(0, Math.floor(score)));

export const createAppsInTossClient = (bridge?: AppsInTossGameBridge): TossClient => ({
  async getUserKey() {
    if (!bridge?.getUserKeyForGame || !isSupported(bridge, TOSS_GAME_USER_KEY_MIN_VERSION)) {
      return undefined;
    }

    try {
      const result = await bridge.getUserKeyForGame();

      if (result && typeof result === "object" && result.type === "HASH" && result.hash.length > 0) {
        return result.hash;
      }
    } catch {
      return undefined;
    }

    return undefined;
  },

  async submitLeaderboardScore(score: number): Promise<LeaderboardSubmitResult> {
    if (!bridge?.submitGameCenterLeaderBoardScore) {
      return { ok: false, errorCode: "TOSS_SDK_UNAVAILABLE" };
    }

    if (!isSupported(bridge)) {
      return { ok: false, errorCode: "TOSS_VERSION_UNSUPPORTED" };
    }

    try {
      const result = await bridge.submitGameCenterLeaderBoardScore({
        score: normalizeScore(score)
      });

      if (!result) {
        return { ok: false, errorCode: "TOSS_VERSION_UNSUPPORTED" };
      }

      return result.statusCode === "SUCCESS"
        ? { ok: true }
        : { ok: false, errorCode: result.statusCode ?? "TOSS_LEADERBOARD_SUBMIT_FAILED" };
    } catch {
      return { ok: false, errorCode: "TOSS_LEADERBOARD_SUBMIT_EXCEPTION" };
    }
  },

  async openLeaderboard() {
    if (!bridge?.openGameCenterLeaderboard || !isSupported(bridge)) {
      return;
    }

    await bridge.openGameCenterLeaderboard();
  }
});
