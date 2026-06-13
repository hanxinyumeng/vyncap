import { useEffect, useState, useRef } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { useAnnotation } from './hooks/useAnnotation';
import { ScreenshotCanvas } from './components/ScreenshotCanvas';
import { Toolbar } from './components/Toolbar';
import { ColorPicker } from './components/ColorPicker';
import { SizeSelector } from './components/SizeSelector';
import { ActionButtons } from './components/ActionButtons';

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
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const {
    state,
    captureScreen,
    setSelection,
    setCurrentTool,
    setCurrentColor,
    setCurrentSize,
    copyToClipboard,
    reset,
  } = useScreenshot();

  const {
    annotations,
    currentAnnotation,
    startAnnotation,
    updateAnnotation,
    finishAnnotation,
    addTextAnnotation,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAnnotation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        captureScreen();
      }
      if (e.key === 'Escape') {
        if (state.image) {
          setSelectionComplete(false);
          reset();
        }
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captureScreen, setSelection, undo, redo, reset, state.image]);

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
    setPinnedImages(prev => [...prev, {
      id: Date.now(),
      src,
      x: sel.x,
      y: sel.y,
      width: sel.width,
      height: sel.height,
    }]);
    setSelectionComplete(false);
    reset();
  };

  const handlePinDragStart = (id: number, e: React.MouseEvent) => {
    const pin = pinnedImages.find(p => p.id === id);
    if (!pin) return;
    dragRef.current = { id, offsetX: e.clientX - pin.x, offsetY: e.clientY - pin.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const { id: dragId, offsetX, offsetY } = dragRef.current;
      setPinnedImages(prev => prev.map(p =>
        p.id === dragId ? { ...p, x: ev.clientX - offsetX, y: ev.clientY - offsetY } : p
      ));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const closePin = (id: number) => {
    setPinnedImages(prev => prev.filter(p => p.id !== id));
  };

  const handleSelectionComplete = () => {
    setSelectionComplete(true);
  };

  if (!state.image) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Screenshot Tool</h1>
          <p className="text-gray-600 mb-4">Press Ctrl+Alt+A to take a screenshot</p>
          <button onClick={captureScreen} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Take Screenshot
          </button>
        </div>
        {pinnedImages.map(pin => (
          <div key={pin.id} className="fixed shadow-2xl border border-gray-300 rounded overflow-hidden z-50"
            style={{ left: pin.x, top: pin.y, width: pin.width, height: pin.height }}
            onMouseDown={e => handlePinDragStart(pin.id, e)}
          >
            <button onClick={() => closePin(pin.id)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 z-10"
              style={{ opacity: undefined }}
            >×</button>
            <img src={pin.src} className="w-full h-full object-contain pointer-events-none" draggable={false} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      <ScreenshotCanvas
        image={state.image}
        selection={state.selection}
        annotations={annotations}
        currentAnnotation={currentAnnotation}
        currentTool={state.currentTool}
        currentColor={state.currentColor}
        currentSize={state.currentSize}
        onSelectionChange={setSelection}
        onSelectionComplete={handleSelectionComplete}
        onStartAnnotation={startAnnotation}
        onUpdateAnnotation={updateAnnotation}
        onFinishAnnotation={finishAnnotation}
        onAddTextAnnotation={addTextAnnotation}
      />

      {selectionComplete && state.selection && (() => {
        const sel = state.selection;
        const gap = 8;
        const toolH = 160;
        const belowOk = sel.y + sel.height + gap + toolH < window.innerHeight;
        const top = belowOk ? sel.y + sel.height + gap : sel.y - gap - toolH;
        const left = Math.max(0, Math.min(sel.x + sel.width - 260, window.innerWidth - 260));
        return (
          <div className="absolute z-50 flex flex-col gap-1.5 items-end" style={{ top, left }}>
            <ActionButtons onCopy={handleCopy} onSave={handleSave} onCancel={handleCancel} onPin={handlePin} />
            <Toolbar currentTool={state.currentTool} onToolChange={setCurrentTool} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
            <ColorPicker currentColor={state.currentColor} onColorChange={setCurrentColor} />
            <SizeSelector currentSize={state.currentSize} onSizeChange={setCurrentSize} />
          </div>
        );
      })()}

      {pinnedImages.map(pin => (
        <div key={pin.id} className="fixed shadow-2xl border border-gray-300 rounded overflow-hidden z-[100]"
          style={{ left: pin.x, top: pin.y, width: pin.width, height: pin.height }}
          onMouseDown={e => handlePinDragStart(pin.id, e)}
        >
          <button onClick={() => closePin(pin.id)}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center-center hover:bg-red-700 z-10"
          >×</button>
          <img src={pin.src} className="w-full h-full object-contain pointer-events-none" draggable={false} />
        </div>
      ))}
    </div>
  );
}
