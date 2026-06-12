import { AnnotationTool } from '../types';

interface ToolbarProps {
  currentTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { tool: AnnotationTool; label: string; icon: string }[] = [
  { tool: 'rectangle', label: 'Rectangle', icon: '□' },
  { tool: 'arrow', label: 'Arrow', icon: '→' },
  { tool: 'text', label: 'Text', icon: 'T' },
  { tool: 'mosaic', label: 'Mosaic', icon: '▦' },
  { tool: 'highlight', label: 'Highlight', icon: '▬' },
];

export function Toolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-lg">
      {tools.map(({ tool, label, icon }) => (
        <button
          key={tool}
          onClick={() => onToolChange(tool)}
          className={`p-2 rounded ${
            currentTool === tool
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          title={label}
        >
          {icon}
        </button>
      ))}
      
      <div className="w-px bg-gray-300 mx-2" />
      
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        title="Undo"
      >
        ↩
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        title="Redo"
      >
        ↪
      </button>
    </div>
  );
}
