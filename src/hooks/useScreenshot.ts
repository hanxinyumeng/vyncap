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
      const base64 = await invoke<string>('capture_screen');
      // Set image first so canvas has content before going fullscreen
      setState(prev => ({ ...prev, image: base64, selection: null }));
      // Wait one frame for React to render the canvas with the image
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      await invoke('set_fullscreen');
      return base64;
    } catch (error) {
      console.error('Failed to capture screen:', error);
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
    await invoke('set_windowed');
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
