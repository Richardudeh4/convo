import { AppSettings, loadSettings, updateSettings } from "@/lib/settings";
import { useCallback, useEffect, useState } from "react";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    soundEffectsEnabled: true,
    hapticsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadSettings();
      setSettings(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSoundEffectsEnabled = useCallback(async (value: boolean) => {
    const next = await updateSettings({ soundEffectsEnabled: value });
    setSettings(next);
  }, []);

  const setHapticsEnabled = useCallback(async (value: boolean) => {
    const next = await updateSettings({ hapticsEnabled: value });
    setSettings(next);
  }, []);

  return {
    settings,
    loading,
    refresh,
    setSoundEffectsEnabled,
    setHapticsEnabled,
  };
}
