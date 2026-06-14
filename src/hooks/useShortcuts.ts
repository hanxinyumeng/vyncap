import { useState, useCallback, useEffect } from 'react';
import { ShortcutsConfig } from '../types';

const STORAGE_KEY = 'shortcuts-config';

const defaultConfig: ShortcutsConfig = {
  capture: 'Ctrl+Alt+A',
};

export function useShortcuts() {
  const [config, setConfig] = useState<ShortcutsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const parseShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
    return {
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      key: parts.filter(p => !['ctrl', 'alt', 'shift'].includes(p))[0] || '',
    };
  }, []);

  const matchesShortcut = useCallback((e: KeyboardEvent, shortcut: string) => {
    const { ctrl, alt, shift, key } = parseShortcut(shortcut);
    return (
      e.ctrlKey === ctrl &&
      e.altKey === alt &&
      e.shiftKey === shift &&
      e.key.toLowerCase() === key
    );
  }, [parseShortcut]);

  const formatShortcut = useCallback((e: KeyboardEvent): string => {
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    const key = e.key.toUpperCase();
    if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
      parts.push(key.length === 1 ? key : e.key);
    }
    return parts.join('+');
  }, []);

  return { config, setConfig, matchesShortcut, formatShortcut };
}
