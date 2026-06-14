import { useState, useCallback, useEffect } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'app-settings';

function migrateSettings(saved: any): AppSettings {
  const s = { ...DEFAULT_SETTINGS, ...saved };
  s.ai = { ...DEFAULT_SETTINGS.ai, ...s.ai };
  s.shortcuts = { ...DEFAULT_SETTINGS.shortcuts, ...s.shortcuts };
  if (!Array.isArray(s.toolbarButtons)) s.toolbarButtons = DEFAULT_SETTINGS.toolbarButtons;
  if (!Array.isArray(s.ai.aiButtons)) s.ai.aiButtons = DEFAULT_SETTINGS.ai.aiButtons;
  return s as AppSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_SETTINGS;
      return migrateSettings(JSON.parse(saved));
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings(updater);
  }, []);

  return { settings, updateSettings };
}
