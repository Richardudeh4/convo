import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "app-settings";

export interface AppSettings {
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEffectsEnabled: true,
  hapticsEnabled: true,
};

let cache: AppSettings = { ...DEFAULT_SETTINGS };

export function getSettingsSync(): AppSettings {
  return cache;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      cache = { ...DEFAULT_SETTINGS };
      return cache;
    }
    cache = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    return cache;
  } catch {
    cache = { ...DEFAULT_SETTINGS };
    return cache;
  }
}

export async function updateSettings(
  partial: Partial<AppSettings>,
): Promise<AppSettings> {
  cache = { ...cache, ...partial };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(cache));
  return cache;
}
