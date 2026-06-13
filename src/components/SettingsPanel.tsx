import { AIConfig } from '../types';

interface SettingsPanelProps {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
  onClose: () => void;
}

export function SettingsPanel({ config, onChange, onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">AI 设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API 地址</label>
            <input
              type="text"
              value={config.apiUrl}
              onChange={e => onChange({ ...config, apiUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => onChange({ ...config, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
            <input
              type="text"
              value={config.model}
              onChange={e => onChange({ ...config, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="gpt-4o"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">提示词</label>
            <textarea
              value={config.prompt}
              onChange={e => onChange({ ...config, prompt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="请根据截图内容回答问题..."
            />
          </div>
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
