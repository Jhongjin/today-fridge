export type SoundEvent =
  | "fridge_open"
  | "ingredient_select"
  | "match_clear"
  | "recipe_complete"
  | "expiring_rescue"
  | "round_complete"
  | "round_fail"
  | "leaderboard_submit";

export type AudioController = {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  play: (event: SoundEvent) => void;
  getHistory: () => SoundEvent[];
  clearHistory: () => void;
};

export const createAudioController = (): AudioController => {
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
    },
    getHistory() {
      return [...history];
    },
    clearHistory() {
      history.length = 0;
    }
  };
};

