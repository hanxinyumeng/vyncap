import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ScreenshotState, Rect } from '../types';

export function useScreenshot() {
  const [state, setState] = useState<ScreenshotState>({
    image: null,
    selection: null,
    annotations: [],
    currentTool: 'rectangle',
    currentColor: '#ff0000',
    currentSize: 3,
    history: [[]],
    historyIndex: 0,
  });

  const captureScreen = useCallback(async () => {
    try {
      // 1. Hide window first so it's invisible during all transitions
      await invoke('hide_window');
      // 2. Wait for window to be fully hidden
      await new Promise(r => setTimeout(r, 200));
      // 3. Capture desktop (window is hidden, won't appear in screenshot)
      const base64 = await invoke<string>('capture_screen');
      // 4. Go fullscreen (invisible, no flash)
      await invoke('set_fullscreen');
      // 5. Set image
      setState(prev => ({ ...prev, image: base64, selection: null }));
      // 6. Wait for React to render the canvas
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      // 7. Show window (already fullscreen with image)
      await invoke('show_window');
      return base64;
    } catch (error) {
      // If anything fails, make sure window is visible again
      await invoke('show_window').catch(() => {});
      console.error('Failed to capture screen:', error);
      alert(`截图失败: ${error}`);
      throw error;
    }
  }, []);

  const setSelection = useCallback((selection: Rect | null) => {
    setState(prev => ({ ...prev, selection }));
  }, []);

  const setCurrentTool = useCallback((tool: ScreenshotState['currentTool']) => {
    setState(prev => ({ ...prev, currentTool: tool }));
  }, []);

  const setCurrentColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, currentColor: color }));
  }, []);

  const setCurrentSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, currentSize: size }));
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!state.image) return;
    try {
      await navigator.clipboard.writeText(`data:image/png;base64,${state.image}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }, [state.image]);

  const reset = useCallback(async () => {
    setState(prev => ({
      ...prev,
      image: null,
      selection: null,
      annotations: [],
    }));
    await invoke('hide_window');
    await invoke('set_windowed');
    await invoke('show_window');
  }, []);

  return {
    state,
    captureScreen,
    setSelection,
    setCurrentTool,
    setCurrentColor,
    setCurrentSize,
    copyToClipboard,
    reset,
  };
}
