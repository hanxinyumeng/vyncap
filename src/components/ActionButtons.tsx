interface ActionButtonsProps {
  onCopy: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPin: () => void;
  onAI: () => void;
  aiLoading: boolean;
}

export function ActionButtons({ onCopy, onSave, onCancel, onPin, onAI, aiLoading }: ActionButtonsProps) {
  const btnBase = "w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-200";

  return (
    <div className="flex gap-1.5 p-1.5 bg-white rounded-lg shadow-lg">
      <button onClick={onAI} disabled={aiLoading}
        className={`${btnBase} disabled:opacity-50`}
        title="AI 答题"
      >
        {aiLoading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z" />
            <path d="M9 18h6" /><path d="M10 22h4" /><circle cx="9" cy="7" r="0.5" fill="currentColor" /><circle cx="15" cy="7" r="0.5" fill="currentColor" />
          </svg>
        )}
      </button>
      <button onClick={onPin} className={btnBase} title="Pin (钉图)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17v5" /><path d="M9 2h6l-1 7h4l-7 7-2-5-5-2 7-7z" />
        </svg>
      </button>
      <button onClick={onCopy} className={btnBase} title="Copy (复制)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button onClick={onSave} className={btnBase} title="Save (保存)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button onClick={onCancel} className={btnBase} title="Cancel (取消)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
