import type { LeaderboardSubmitResult, TossClient } from "./tossClient";

type SubmitGameCenterLeaderBoardScoreResponse = {
  statusCode?: string;
};

export type AppsInTossGameBridge = {
  isMinVersionSupported?: (params: { android: string; ios: string }) => boolean;
  submitGameCenterLeaderBoardScore?: (params: { score: string }) => Promise<SubmitGameCenterLeaderBoardScoreResponse | undefined>;
  openGameCenterLeaderboard?: () => Promise<void | undefined> | void;
};

export const TOSS_GAME_CENTER_MIN_VERSION = {
  android: "5.221.0",
  ios: "5.221.0"
} as const;

const isSupported = (bridge: AppsInTossGameBridge): boolean =>
  bridge.isMinVersionSupported ? bridge.isMinVersionSupported(TOSS_GAME_CENTER_MIN_VERSION) : true;

const normalizeScore = (score: number): string => String(Math.max(0, Math.floor(score)));

export const createAppsInTossClient = (bridge?: AppsInTossGameBridge): TossClient => ({
  async getUserKey() {
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
