export const TOSS_CLIENT_ERROR_CODES = [
  "DUPLICATE_PLAY_ID",
  "LEADERBOARD_NOT_FOUND",
  "PROFILE_NOT_FOUND",
  "TOSS_LEADERBOARD_SUBMIT_EXCEPTION",
  "TOSS_LEADERBOARD_SUBMIT_FAILED",
  "TOSS_SDK_UNAVAILABLE",
  "TOSS_VERSION_UNSUPPORTED",
  "UNPARSABLE_SCORE"
] as const;

export type TossClientErrorCode = (typeof TOSS_CLIENT_ERROR_CODES)[number];

const tossClientErrorCodeSet = new Set<string>(TOSS_CLIENT_ERROR_CODES);

export const isTossClientErrorCode = (code: string): code is TossClientErrorCode => tossClientErrorCodeSet.has(code);

export const toTossClientErrorCode = (code: string | undefined): TossClientErrorCode =>
  code && isTossClientErrorCode(code) ? code : "TOSS_LEADERBOARD_SUBMIT_FAILED";

export type LeaderboardSubmitResult =
  | {
      ok: true;
      errorCode?: never;
    }
  | {
      ok: false;
      errorCode: TossClientErrorCode;
    };

export type TossClient = {
  getUserKey: () => Promise<string | undefined>;
  submitLeaderboardScore: (score: number, playId: string) => Promise<LeaderboardSubmitResult>;
  openLeaderboard: () => Promise<void>;
};

export const createBrowserTossClient = (): TossClient => ({
  async getUserKey() {
    return undefined;
  },
  async submitLeaderboardScore() {
    return { ok: false, errorCode: "TOSS_SDK_UNAVAILABLE" };
  },
  async openLeaderboard() {
    return undefined;
  }
});
