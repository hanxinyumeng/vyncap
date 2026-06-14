import { useEffect, useState, useRef } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { useAI } from './hooks/useAI';
import { useShortcuts } from './hooks/useShortcuts';
import { ScreenshotCanvas } from './components/ScreenshotCanvas';
import { ActionButtons } from './components/ActionButtons';
import { SettingsPanel } from './components/SettingsPanel';

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

  const {
    state, captureScreen, setSelection, copyToClipboard, reset,
  } = useScreenshot();

  const { config, setConfig, askAI, answer, loading: aiLoading, error: aiError, clearAnswer } = useAI();
  const { config: shortcuts, setConfig: setShortcuts, matchesShortcut } = useShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, shortcuts.capture)) { e.preventDefault(); captureScreen(); }
      if (e.key === 'Escape') {
        if (showSettings) { setShowSettings(false); return; }
        if (answer || aiError) { clearAnswer(); return; }
        if (state.image) { setSelectionComplete(false); reset(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captureScreen, setSelection, reset, state.image, showSettings, answer, aiError, clearAnswer, shortcuts, matchesShortcut]);

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
      console.log('[Copy] Converting data URL to blob via fetch, length:', src.length);
      const resp = await fetch(src);
      if (!resp.ok) throw new Error(`fetch data URL failed: ${resp.status} ${resp.statusText}`);
      const blob = await resp.blob();
      console.log('[Copy] Blob size:', blob.size, 'type:', blob.type);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      console.log('[Copy] Clipboard write success');
    } catch (e: any) {
      console.error('[Copy] fetch->clipboard failed:', e.name, e.message);
      console.log('[Copy] Falling back to copyToClipboard');
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

  const handleAI = async () => {
    const src = getCroppedImage();
    if (!src) return;
    await askAI(src);
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

  // Home screen
  if (!state.image) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">AI 答题助手</h1>
          <p className="text-gray-500 mb-6">截图 → 选区 → AI 解答</p>
          <div className="flex gap-3 justify-center">
            <button onClick={captureScreen} className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
              开始截图
            </button>
            <button onClick={() => setShowSettings(true)} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
              设置
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">快捷键: {shortcuts.capture}</p>
          {!config.apiKey && <p className="text-orange-500 text-sm mt-4">⚠ 请先点击「设置」配置 API Key</p>}
        </div>
        {showSettings && <SettingsPanel config={config} onConfigChange={setConfig} shortcuts={shortcuts} onShortcutsChange={setShortcuts} onClose={() => setShowSettings(false)} />}
        {pinnedImages.map(pin => (
          <div key={pin.id} className="fixed shadow-2xl border border-gray-300 rounded overflow-hidden z-50"
            style={{ left: pin.x, top: pin.y }} onMouseDown={e => handlePinDragStart(pin.id, e)}>
            <button onClick={() => closePin(pin.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 z-10">×</button>
            <img src={pin.src} className="pointer-events-none" draggable={false} style={{ width: pin.width, height: pin.height }} />
          </div>
        ))}
      </div>
    );
  }

  // Screenshot mode
  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <ScreenshotCanvas
        image={state.image} selection={state.selection}
        onSelectionChange={setSelection} onSelectionComplete={handleSelectionComplete}
      />

      {selectionComplete && state.selection && (() => {
        const sel = state.selection;
        const gap = 8;
        const belowOk = sel.y + sel.height + gap + 50 < window.innerHeight;
        const top = belowOk ? sel.y + sel.height + gap : sel.y - gap - 50;
        const right = window.innerWidth - (sel.x + sel.width);
        return (
          <div className="absolute z-50 flex gap-1.5 items-center" style={{ top, right }}>
            <ActionButtons onCopy={handleCopy} onSave={handleSave} onCancel={handleCancel} onPin={handlePin} onAI={handleAI} aiLoading={aiLoading} />
          </div>
        );
      })()}

      {(answer || aiError || aiLoading) && selectionComplete && state.selection && (() => {
        const sel = state.selection;
        const top = sel.y + sel.height + 8;
        const right = window.innerWidth - (sel.x + sel.width);
        const width = Math.min(sel.width, window.innerWidth - sel.x - 16);
        return (
          <div className="absolute z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border overflow-hidden"
            style={{ top, right, width: Math.max(width, 300), maxHeight: 400 }}>
            <div className="flex items-center justify-between px-4 py-2 bg-purple-50 border-b">
              <span className="text-sm font-semibold text-purple-700">AI 解答</span>
              <button onClick={clearAnswer} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-4 py-3 overflow-y-auto max-h-[340px]">
              {aiLoading && (
                <div className="flex items-center gap-2 text-purple-600">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
                  </svg>
                  <span className="text-sm">正在分析截图...</span>
                </div>
              )}
              {aiError && <div className="text-red-500 text-sm">{aiError}</div>}
              {answer && <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</div>}
            </div>
          </div>
        );
      })()}

      {pinnedImages.map(pin => (
        <div key={pin.id} className="fixed shadow-2xl border border-gray-300 rounded overflow-hidden z-[100]"
          style={{ left: pin.x, top: pin.y }} onMouseDown={e => handlePinDragStart(pin.id, e)}>
          <button onClick={() => closePin(pin.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 z-10">×</button>
          <img src={pin.src} className="pointer-events-none" draggable={false} style={{ width: pin.width, height: pin.height }} />
        </div>
      ))}

      {showSettings && <SettingsPanel config={config} onConfigChange={setConfig} shortcuts={shortcuts} onShortcutsChange={setShortcuts} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
