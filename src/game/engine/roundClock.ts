export type ActiveRoundDurationInput = {
  nowMs: number;
  startedAtMs: number;
  totalPausedMs: number;
  pausedStartedAtMs?: number | null;
};

export const pausedDurationMs = (pausedStartedAtMs: number | null, resumedAtMs: number) => {
  if (pausedStartedAtMs === null) {
    return 0;
  }

  return Math.max(0, resumedAtMs - pausedStartedAtMs);
};

export const activeRoundDurationMs = ({
  nowMs,
  startedAtMs,
  totalPausedMs,
  pausedStartedAtMs = null
}: ActiveRoundDurationInput) => {
  const currentPausedMs = pausedDurationMs(pausedStartedAtMs, nowMs);

  return Math.max(0, nowMs - startedAtMs - totalPausedMs - currentPausedMs);
};
