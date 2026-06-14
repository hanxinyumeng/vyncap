import { AIButton, ToolbarActionId } from '../types';
import { useI18n } from '../i18n/context';

interface ActionButtonsProps {
  toolbarButtons: ToolbarActionId[];
  aiButtons: AIButton[];
  onCopy: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPin: () => void;
  onAI: (button: AIButton) => void;
  aiLoading: boolean;
}

const ACTION_ICONS: Record<ToolbarActionId, JSX.Element> = {
  copy: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  save: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  cancel: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  pin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" /><path d="M9 2h6l-1 7h4l-7 7-2-5-5-2 7-7z" />
    </svg>
  ),
};

const ACTION_HANDLERS = {
  copy: 'onCopy', save: 'onSave', cancel: 'onCancel', pin: 'onPin',
} as const;

export function ActionButtons({
  toolbarButtons, aiButtons, onCopy, onSave, onCancel, onPin, onAI, aiLoading,
}: ActionButtonsProps) {
  const t = useI18n();
  const btnBase = 'w-8 h-8 flex items-center justify-center rounded-md text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 active:scale-95';
  const handlers = { onCopy, onSave, onCancel, onPin };

  return (
    <div className="flex items-center gap-0.5 px-1.5 py-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/80">
      {toolbarButtons.map((id) => {
        const handlerKey = ACTION_HANDLERS[id] as keyof typeof handlers;
        return (
          <button key={id} onClick={handlers[handlerKey]} className={btnBase}
            title={t.toolbar[id as keyof typeof t.toolbar]}>
            {ACTION_ICONS[id]}
          </button>
        );
      })}

      {aiButtons.length > 0 && (
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
      )}

      {aiButtons.map((btn) => (
        <button key={btn.id} onClick={() => onAI(btn)} disabled={aiLoading}
          className={`${btnBase} disabled:opacity-40 relative group`}
          title={btn.label}>
          {aiLoading ? (
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32" strokeDashoffset="8" />
            </svg>
          ) : btn.iconType === 'image' ? (
            <img src={btn.icon} className="w-4 h-4 object-contain" draggable={false} />
          ) : (
            <span className="text-sm">{btn.icon}</span>
          )}
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  );
}
