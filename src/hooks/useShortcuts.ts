import { useCallback } from 'react';

export function useShortcuts() {
  const parseShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
    return {
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      key: parts.filter(p => !['ctrl', 'alt', 'shift', 'meta'].includes(p))[0] || '',
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

  return { matchesShortcut };
}
