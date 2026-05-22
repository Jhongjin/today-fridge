export type SoundEvent =
  | "fridge_open"
  | "ingredient_select"
  | "match_clear"
  | "recipe_complete"
  | "expiring_rescue"
  | "booster_use"
  | "round_complete"
  | "round_fail"
  | "leaderboard_submit"
  | "result_share";

export type AudioController = {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  play: (event: SoundEvent) => void;
  getHistory: () => SoundEvent[];
  clearHistory: () => void;
};

export type AudioOutput = {
  play: (event: SoundEvent) => void;
};

export const createAudioController = (output?: AudioOutput): AudioController => {
  let muted = false;
  const history: SoundEvent[] = [];

  return {
    setMuted(nextMuted) {
      muted = nextMuted;
    },
    isMuted() {
      return muted;
    },
    play(event) {
      if (muted) {
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
