import type { AudioOutput, SoundEvent } from "./audioController";

type Tone = {
  frequency: number;
  duration: number;
  gain: number;
  type: OscillatorType;
};

const tones: Record<SoundEvent, Tone> = {
  fridge_open: { frequency: 220, duration: 0.12, gain: 0.025, type: "sine" },
  ingredient_select: { frequency: 520, duration: 0.045, gain: 0.018, type: "triangle" },
  match_clear: { frequency: 660, duration: 0.09, gain: 0.024, type: "sine" },
  recipe_complete: { frequency: 784, duration: 0.18, gain: 0.028, type: "triangle" },
  expiring_rescue: { frequency: 880, duration: 0.1, gain: 0.02, type: "sine" },
  booster_use: { frequency: 440, duration: 0.08, gain: 0.016, type: "triangle" },
  round_complete: { frequency: 698, duration: 0.2, gain: 0.026, type: "sine" },
  round_fail: { frequency: 196, duration: 0.14, gain: 0.018, type: "sine" },
  leaderboard_submit: { frequency: 740, duration: 0.11, gain: 0.022, type: "triangle" }
};

export const createWebAudioOutput = (): AudioOutput => {
  let context: AudioContext | undefined;

  const getContext = () => {
    const audioGlobal = globalThis as typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor = globalThis.AudioContext ?? audioGlobal.webkitAudioContext;

    if (!AudioContextConstructor) {
      return undefined;
    }

    context ??= new AudioContextConstructor();
    return context;
  };

  return {
    play(event) {
      try {
        const audioContext = getContext();

        if (!audioContext) {
          return;
        }

        const tone = tones[event];
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(tone.gain, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + tone.duration + 0.02);
      } catch {
        // Audio should never block gameplay.
      }
    }
  };
};
