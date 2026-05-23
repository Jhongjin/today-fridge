type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

type PlayerPreferences = {
  muted?: boolean;
  reduceMotion?: boolean;
};

const preferencesKey = "today-fridge:preferences";

const getDefaultStorage = (): PreferenceStorage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const readPreferences = (storage = getDefaultStorage()): PlayerPreferences => {
  if (!storage) {
    return {};
  }

  try {
    const rawValue = storage.getItem(preferencesKey);
    const value = rawValue ? JSON.parse(rawValue) : {};

    return typeof value === "object" && value !== null ? value : {};
  } catch {
    return {};
  }
};

const writePreferences = (patch: PlayerPreferences, storage = getDefaultStorage()): PlayerPreferences => {
  const nextPreferences = {
    ...readPreferences(storage),
    ...patch
  };

  try {
    storage?.setItem(preferencesKey, JSON.stringify(nextPreferences));
  } catch {
    // Preferences are a convenience; storage failures should not affect play.
  }

  return nextPreferences;
};

export const readMutedPreference = (storage = getDefaultStorage()) => readPreferences(storage).muted === true;

export const readReduceMotionPreference = (storage = getDefaultStorage()) =>
  readPreferences(storage).reduceMotion === true;

export const writeMutedPreference = (muted: boolean, storage = getDefaultStorage()) =>
  writePreferences({ muted }, storage);

export const writeReduceMotionPreference = (reduceMotion: boolean, storage = getDefaultStorage()) =>
  writePreferences({ reduceMotion }, storage);
