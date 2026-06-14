import { useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AppSettings, DEFAULT_SETTINGS, DEFAULT_AI_BUTTONS } from '../types';

function migrateSettings(saved: any): AppSettings {
  const s = { ...DEFAULT_SETTINGS, ...saved };
  s.ai = { ...DEFAULT_SETTINGS.ai, ...s.ai };
  s.shortcuts = { ...DEFAULT_SETTINGS.shortcuts, ...s.shortcuts };
  if (!Array.isArray(s.toolbarButtons)) s.toolbarButtons = DEFAULT_SETTINGS.toolbarButtons;
  if (!Array.isArray(s.ai.aiButtons)) {
    s.ai.aiButtons = DEFAULT_AI_BUTTONS;
  } else {
    const savedIds = new Set(s.ai.aiButtons.map((b: any) => b.id));
    const newDefaults = DEFAULT_AI_BUTTONS.filter(b => !savedIds.has(b.id));
    s.ai.aiButtons = [...s.ai.aiButtons, ...newDefaults];
  }
  return s as AppSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      try {
        const data = await invoke<string>('read_config');
        if (data && data.trim()) {
          setSettings(migrateSettings(JSON.parse(data)));
        }
      } catch {
        try {
          const local = localStorage.getItem('app-settings');
          if (local) setSettings(migrateSettings(JSON.parse(local)));
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const json = JSON.stringify(settings, null, 2);
    invoke('write_config', { data: json }).catch(() => {
      localStorage.setItem('app-settings', json);
    });
  }, [settings]);

  const updateSettings = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings(updater);
  }, []);

  return { settings, updateSettings };
}
