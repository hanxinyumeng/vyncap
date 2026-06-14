import { useState, useRef, useEffect } from 'react';
import { AIConfig, ShortcutsConfig } from '../types';

interface SettingsPanelProps {
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  shortcuts: ShortcutsConfig;
  onShortcutsChange: (shortcuts: ShortcutsConfig) => void;
  onClose: () => void;
}

type Tab = 'ai' | 'shortcuts';

export function SettingsPanel({ config, onConfigChange, shortcuts, onShortcutsChange, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>('ai');
  const [recording, setRecording] = useState(false);
  const recordRef = useRef<string | null>(null);

  useEffect(() => {
    if (!recording) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      const key = e.key.toUpperCase();
      if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
        parts.push(key.length === 1 ? key : e.key);
      }
      const combo = parts.join('+');
      if (combo && parts.length > 1) {
        recordRef.current = combo;
        onShortcutsChange({ ...shortcuts, capture: combo });
        setRecording(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recording, shortcuts, onShortcutsChange]);

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="flex border-b px-6">
          <button className={tabClass('ai')} onClick={() => setTab('ai')}>AI 设置</button>
          <button className={tabClass('shortcuts')} onClick={() => setTab('shortcuts')}>快捷键</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {tab === 'ai' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API 地址</label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={e => onConfigChange({ ...config, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => onConfigChange({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => onConfigChange({ ...config, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="gpt-4o"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">提示词</label>
                <textarea
                  value={config.prompt}
                  onChange={e => onConfigChange({ ...config, prompt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="请根据截图内容回答问题..."
                />
              </div>
            </>
          )}

          {tab === 'shortcuts' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">截图快捷键</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shortcuts.capture}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none"
                />
                <button
                  onClick={() => setRecording(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    recording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {recording ? '按下快捷键...' : '修改'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">点击「修改」后按下新的快捷键组合，需包含 Ctrl/Alt/Shift 修饰键。</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
