import { useEffect, useState } from 'react';
import { useScreenshot } from './hooks/useScreenshot';
import { useAnnotation } from './hooks/useAnnotation';
import { ScreenshotCanvas } from './components/ScreenshotCanvas';
import { Toolbar } from './components/Toolbar';
import { ColorPicker } from './components/ColorPicker';
import { SizeSelector } from './components/SizeSelector';
import { ActionButtons } from './components/ActionButtons';

export default function App() {
  const [selectionComplete, setSelectionComplete] = useState(false);

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
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captureScreen, setSelection, undo, redo, reset, state.image]);

  const handleSave = async () => {
    if (!state.image) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSelectionComplete(false);
    await reset();
  };

  const handleCancel = async () => {
    setSelectionComplete(false);
    await reset();
  };

  const handleCopy = async () => {
    await copyToClipboard();
    setSelectionComplete(false);
    await reset();
  };

  const handleSelectionComplete = () => {
    setSelectionComplete(true);
  };

  if (!state.image) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Screenshot Tool</h1>
          <p className="text-gray-600 mb-4">
            Press Ctrl+Alt+A to take a screenshot
          </p>
          <button
            onClick={captureScreen}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Take Screenshot
          </button>
        </div>
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

      {selectionComplete && state.selection && (
        <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
          <ActionButtons
            onCopy={handleCopy}
            onSave={handleSave}
            onCancel={handleCancel}
          />
          <Toolbar
            currentTool={state.currentTool}
            onToolChange={setCurrentTool}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          <ColorPicker
            currentColor={state.currentColor}
            onColorChange={setCurrentColor}
          />
          <SizeSelector
            currentSize={state.currentSize}
            onSizeChange={setCurrentSize}
          />
        </div>
      )}
    </div>
  );
}
