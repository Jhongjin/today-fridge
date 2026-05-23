export const SOUND_EVENTS = [
  "fridge_open",
  "ingredient_select",
  "match_clear",
  "recipe_complete",
  "expiring_rescue",
  "booster_use",
  "game_pause",
  "game_resume",
  "round_complete",
  "round_fail",
  "leaderboard_submit",
  "result_share"
] as const;

export type SoundEvent = (typeof SOUND_EVENTS)[number];

export type AudioController = {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  setSuspended: (suspended: boolean) => void;
  isSuspended: () => boolean;
  play: (event: SoundEvent) => void;
  getHistory: () => SoundEvent[];
  clearHistory: () => void;
};

export type AudioOutput = {
  play: (event: SoundEvent) => void;
};

export const createAudioController = (output?: AudioOutput): AudioController => {
  let muted = false;
  let suspended = false;
  const history: SoundEvent[] = [];

  return {
    setMuted(nextMuted) {
      muted = nextMuted;
    },
    isMuted() {
      return muted;
    },
    setSuspended(nextSuspended) {
      suspended = nextSuspended;
    },
    isSuspended() {
      return suspended;
    },
    play(event) {
      if (muted || suspended) {
        return;
      }

      history.push(event);
      output?.play(event);
    },
    getHistory() {
      return [...history];
    },
    clearHistory() {
      history.length = 0;
    }
  };
};
