import type { LeaderboardSubmitResult, TossClient } from "./tossClient";

export const createTossMockClient = (): TossClient => {
  const submittedPlayIds = new Set<string>();

  return {
    async getUserKey() {
      return "mock-user-key";
    },
    async submitLeaderboardScore(_score: number, playId: string): Promise<LeaderboardSubmitResult> {
      if (submittedPlayIds.has(playId)) {
        return { ok: false, errorCode: "DUPLICATE_PLAY_ID" };
      }

      submittedPlayIds.add(playId);
      return { ok: true };
    },
    async openLeaderboard() {
      return undefined;
    }
  };
};

