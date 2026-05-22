export type LeaderboardSubmitResult = {
  ok: boolean;
  errorCode?: string;
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

