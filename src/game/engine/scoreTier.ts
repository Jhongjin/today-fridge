import type { RoundStatus } from "../types";

export type ScoreTier = "S" | "A" | "B" | "C" | "연습" | "아쉬움";

export const scoreTierFor = ({
  cleanRun,
  score,
  status
}: {
  cleanRun: boolean;
  score: number;
  status: RoundStatus;
}): ScoreTier => {
  if (status === "failed") {
    return "아쉬움";
  }

  if (!cleanRun) {
    return "연습";
  }

  if (score >= 1700) {
    return "S";
  }

  if (score >= 1400) {
    return "A";
  }

  if (score >= 1000) {
    return "B";
  }

  return "C";
};
