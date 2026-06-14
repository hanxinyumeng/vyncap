import { useEffect, useState, useRef } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { useAI } from './hooks/useAI';
import { useShortcuts } from './hooks/useShortcuts';
import { useSettings } from './hooks/useSettings';
import { I18nContext } from './i18n/context';
import { locales } from './i18n/locales';
import { ScreenshotCanvas } from './components/ScreenshotCanvas';
import { ActionButtons } from './components/ActionButtons';
import { SettingsPanel } from './components/SettingsPanel';
import { AIButton } from './types';

interface PinnedImage {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function App() {
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [pinnedImages, setPinnedImages] = useState<PinnedImage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const { settings, updateSettings } = useSettings();
  const t = locales[settings.language];

  const {
    state, captureScreen, setSelection, copyToClipboard, reset,
  } = useScreenshot();

  const { askAI, answer, loading: aiLoading, error: aiError, clearAnswer } = useAI(settings.ai);
  const { matchesShortcut } = useShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, settings.shortcuts.capture)) { e.preventDefault(); captureScreen(); }
      if (e.key === 'Escape') {
        if (showSettings) { setShowSettings(false); return; }
        if (answer || aiError) { clearAnswer(); return; }
        if (state.image) { setSelectionComplete(false); reset(); }
      }
    };
    const handleTriggerCapture = () => captureScreen();
    const handleTriggerSettings = () => setShowSettings(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-capture', handleTriggerCapture);
    window.addEventListener('trigger-settings', handleTriggerSettings);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-capture', handleTriggerCapture);
      window.removeEventListener('trigger-settings', handleTriggerSettings);
    };
  }, [captureScreen, reset, state.image, showSettings, answer, aiError, clearAnswer, settings.shortcuts, matchesShortcut]);

  const getCroppedImage = (): string | null => {
    const canvas = document.querySelector('canvas');
    if (!canvas || !state.selection) return null;
    const sel = state.selection;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = sel.width;
    tmpCanvas.height = sel.height;
    const ctx = tmpCanvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(canvas, sel.x, sel.y, sel.width, sel.height, 0, 0, sel.width, sel.height);
    return tmpCanvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    const src = getCroppedImage();
    if (!src) return;
    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
    link.href = src;
    link.click();
    setSelectionComplete(false);
    await reset();
  };

  const handleCancel = async () => {
    setSelectionComplete(false);
    clearAnswer();
    await reset();
  };

  const handleCopy = async () => {
    const src = getCroppedImage();
    if (!src) return;
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      await copyToClipboard();
    }
    setSelectionComplete(false);
    await reset();
  };

  const handlePin = () => {
    const src = getCroppedImage();
    if (!src || !state.selection) return;
    const sel = state.selection;
    setPinnedImages(prev => [...prev, { id: Date.now(), src, x: sel.x, y: sel.y, width: sel.width, height: sel.height }]);
    setSelectionComplete(false);
    reset();
  };

  const handleAI = async (button: AIButton) => {
    const src = getCroppedImage();
    if (!src) return;
    await askAI(src, button.prompt);
  };

  const handlePinDragStart = (id: number, e: React.MouseEvent) => {
    const pin = pinnedImages.find(p => p.id === id);
    if (!pin) return;
    dragRef.current = { id, offsetX: e.clientX - pin.x, offsetY: e.clientY - pin.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const { id: did, ox, oy } = { id: dragRef.current.id, ox: dragRef.current.offsetX, oy: dragRef.current.offsetY };
      setPinnedImages(prev => prev.map(p => p.id === did ? { ...p, x: ev.clientX - ox, y: ev.clientY - oy } : p));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const closePin = (id: number) => setPinnedImages(prev => prev.filter(p => p.id !== id));
  const handleSelectionComplete = () => setSelectionComplete(true);

  return (
    <I18nContext.Provider value={t}>
      {!state.image ? (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">{t.app.title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.app.subtitle}</p>
            <div className="flex gap-2.5 justify-center">
              <button onClick={captureScreen}
                className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 text-sm font-medium shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]">
                {t.home.capture}
              </button>
              <button onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 bg-white text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium border border-gray-200 shadow-sm transition-all active:scale-[0.98]">
                {t.home.settings}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-4">{t.home.shortcut}: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{settings.shortcuts.capture}</span></p>
            {!settings.ai.apiKey && <p className="text-amber-500 text-xs mt-3">⚠ {t.home.apiKeyWarning}</p>}
          </div>
          {showSettings && <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />}
          {pinnedImages.map(pin => (
            <div key={pin.id} className="fixed shadow-2xl border border-gray-200 rounded-lg overflow-hidden z-50"
              style={{ left: pin.x, top: pin.y }} onMouseDown={e => handlePinDragStart(pin.id, e)}>
              <button onClick={() => closePin(pin.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70 z-10 backdrop-blur-sm">×</button>
              <img src={pin.src} className="pointer-events-none" draggable={false} style={{ width: pin.width, height: pin.height }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="fixed inset-0 overflow-hidden bg-transparent">
          <ScreenshotCanvas
            image={state.image} selection={state.selection}
            onSelectionChange={setSelection} onSelectionComplete={handleSelectionComplete}
          />

          {selectionComplete && state.selection && (() => {
            const sel = state.selection;
            const gap = 10;
            const belowOk = sel.y + sel.height + gap + 44 < window.innerHeight;
            const top = belowOk ? sel.y + sel.height + gap : sel.y - gap - 44;
            const right = window.innerWidth - (sel.x + sel.width);
            return (
              <div className="absolute z-50" style={{ top, right }}>
                <ActionButtons
                  toolbarButtons={settings.toolbarButtons}
                  aiButtons={settings.ai.aiButtons}
                  onCopy={handleCopy} onSave={handleSave} onCancel={handleCancel} onPin={handlePin}
                  onAI={handleAI} aiLoading={aiLoading}
                />
              </div>
            );
          })()}

          {(answer || aiError || aiLoading) && selectionComplete && state.selection && (() => {
            const sel = state.selection;
            const top = sel.y + sel.height + 10;
            const right = window.innerWidth - (sel.x + sel.width);
            const width = Math.min(sel.width, window.innerWidth - sel.x - 16);
            return (
              <div className="absolute z-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden"
                style={{ top, right, width: Math.max(width, 320), maxHeight: 420 }}>
                <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/80 border-b border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-600">{t.ai.title}</span>
                  <button onClick={clearAnswer} className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-gray-600 transition-colors text-xs">×</button>
                </div>
                <div className="px-4 py-3 overflow-y-auto max-h-[360px]">
                  {aiLoading && (
                    <div className="flex items-center gap-2.5 text-indigo-500 py-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32" strokeDashoffset="8" />
                      </svg>
                      <span className="text-xs">{t.ai.analyzing}</span>
                    </div>
                  )}
                  {aiError && <div className="text-red-500 text-xs py-1">{aiError}</div>}
                  {answer && <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{answer}</div>}
                </div>
              </div>
            );
          })()}

          {pinnedImages.map(pin => (
            <div key={pin.id} className="fixed shadow-2xl border border-gray-200 rounded-lg overflow-hidden z-[100]"
              style={{ left: pin.x, top: pin.y }} onMouseDown={e => handlePinDragStart(pin.id, e)}>
              <button onClick={() => closePin(pin.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70 z-10 backdrop-blur-sm">×</button>
              <img src={pin.src} className="pointer-events-none" draggable={false} style={{ width: pin.width, height: pin.height }} />
            </div>
          ))}

          {showSettings && <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />}
        </div>
      )}
    </I18nContext.Provider>
  );
}
