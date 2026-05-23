export type HapticEvent =
  | "ingredient_select"
  | "match_clear"
  | "recipe_complete"
  | "expiring_rescue"
  | "booster_use"
  | "game_pause"
  | "game_resume"
  | "round_complete"
  | "round_fail"
  | "leaderboard_submit"
  | "result_share";

export type HapticsController = {
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  play: (event: HapticEvent) => void;
  getHistory: () => HapticEvent[];
};

type Vibrate = (pattern: VibratePattern) => boolean;

const patterns: Record<HapticEvent, VibratePattern> = {
  ingredient_select: 8,
  match_clear: [12, 20, 12],
  recipe_complete: [16, 24, 18],
  expiring_rescue: 10,
  booster_use: 10,
  game_pause: 8,
  game_resume: 8,
  round_complete: [18, 28, 22],
  round_fail: 18,
  leaderboard_submit: 12,
  result_share: 10
};

const getDefaultVibrate = (): Vibrate | undefined => {
  const vibrate = globalThis.navigator?.vibrate;
  return typeof vibrate === "function" ? vibrate.bind(globalThis.navigator) : undefined;
};

export const createHapticsController = (vibrate = getDefaultVibrate()): HapticsController => {
  let enabled = true;
  const history: HapticEvent[] = [];

  return {
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
    },
    isEnabled() {
      return enabled;
    },
    play(event) {
      if (!enabled) {
        return;
      }

      history.push(event);
      vibrate?.(patterns[event]);
    },
    getHistory() {
      return [...history];
    }
  };
};
