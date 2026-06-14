import { useState, useEffect } from 'react';
import { AppSettings, AIButton, ToolbarActionId } from '../types';
import { useI18n } from '../i18n/context';
import type { Lang } from '../i18n/locales';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (updater: (prev: AppSettings) => AppSettings) => void;
  onClose: () => void;
}

type Tab = 'general' | 'ai' | 'aiButtons';

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const t = useI18n();
  const [tab, setTab] = useState<Tab>('general');
  const [recording, setRecording] = useState(false);
  const [editingBtn, setEditingBtn] = useState<AIButton | null>(null);
  const [draftBtn, setDraftBtn] = useState<AIButton>({ id: '', label: '', icon: '🧠', prompt: '' });

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
        onUpdate(prev => ({ ...prev, shortcuts: { ...prev.shortcuts, capture: combo } }));
        setRecording(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recording, onUpdate]);

  const tabDefs: { id: Tab; label: string }[] = [
    { id: 'general', label: t.settings.tabs.general },
    { id: 'ai', label: t.settings.tabs.ai },
    { id: 'aiButtons', label: t.settings.tabs.aiButtons },
  ];

  const tabClass = (id: Tab) =>
    `px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
      tab === id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`;

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all placeholder:text-gray-300';
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider';

  const startEdit = (btn: AIButton) => {
    setEditingBtn(btn);
    setDraftBtn({ ...btn });
  };
  const startNew = () => {
    const btn: AIButton = { id: Date.now().toString(), label: '', icon: '🧠', prompt: '' };
    setEditingBtn(btn);
    setDraftBtn(btn);
  };
  const saveAiButton = () => {
    if (!draftBtn.label.trim()) return;
    onUpdate(prev => {
      const btns = prev.ai.aiButtons;
      const exists = btns.find(b => b.id === draftBtn.id);
      return {
        ...prev,
        ai: {
          ...prev.ai,
          aiButtons: exists ? btns.map(b => b.id === draftBtn.id ? draftBtn : b) : [...btns, draftBtn],
        },
      };
    });
    setEditingBtn(null);
  };
  const deleteAiButton = (id: string) => {
    onUpdate(prev => ({
      ...prev,
      ai: { ...prev.ai, aiButtons: prev.ai.aiButtons.filter(b => b.id !== id) },
    }));
    setEditingBtn(null);
  };

  const toggleToolbarBtn = (id: ToolbarActionId) => {
    onUpdate(prev => ({
      ...prev,
      toolbarButtons: prev.toolbarButtons.includes(id)
        ? prev.toolbarButtons.filter(b => b !== id)
        : [...prev.toolbarButtons, id],
    }));
  };

  const ALL_TOOLBAR: { id: ToolbarActionId; label: string }[] = [
    { id: 'copy', label: t.toolbar.copy },
    { id: 'save', label: t.toolbar.save },
    { id: 'cancel', label: t.toolbar.cancel },
    { id: 'pin', label: t.toolbar.pin },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{t.settings.title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="flex border-b border-gray-100 px-4 gap-0">
          {tabDefs.map(d => (
            <button key={d.id} className={tabClass(d.id)} onClick={() => setTab(d.id)}>{d.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {tab === 'general' && (
            <>
              <div>
                <label className={labelCls}>{t.settings.language}</label>
                <div className="flex gap-2">
                  {(['zh', 'en'] as Lang[]).map(lang => (
                    <button key={lang} onClick={() => onUpdate(p => ({ ...p, language: lang }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        settings.language === lang
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {lang === 'zh' ? '中文' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className={labelCls}>{t.settings.captureShortcut}</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={settings.shortcuts.capture}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none font-mono ${recording ? 'border-indigo-400 ring-2 ring-indigo-500/30' : 'border-gray-200'}`} />
                  <button onClick={() => setRecording(true)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      recording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}>
                    {recording ? t.settings.recording : t.settings.recordBtn}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{t.settings.shortcutHint}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className={labelCls}>{t.settings.toolbarVisible}</label>
                <p className="text-[11px] text-gray-400 mb-3">{t.settings.toolbarHint}</p>
                <div className="space-y-2">
                  {ALL_TOOLBAR.map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={settings.toolbarButtons.includes(id)}
                        onChange={() => toggleToolbarBtn(id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/40" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'ai' && (
            <>
              <div>
                <label className={labelCls}>{t.settings.apiUrl}</label>
                <input type="text" value={settings.ai.apiUrl}
                  onChange={e => onUpdate(p => ({ ...p, ai: { ...p.ai, apiUrl: e.target.value } }))}
                  className={inputCls} placeholder={t.settings.apiUrlPh} />
              </div>
              <div>
                <label className={labelCls}>{t.settings.apiKey}</label>
                <input type="password" value={settings.ai.apiKey}
                  onChange={e => onUpdate(p => ({ ...p, ai: { ...p.ai, apiKey: e.target.value } }))}
                  className={inputCls} placeholder={t.settings.apiKeyPh} />
              </div>
              <div>
                <label className={labelCls}>{t.settings.model}</label>
                <input type="text" value={settings.ai.model}
                  onChange={e => onUpdate(p => ({ ...p, ai: { ...p.ai, model: e.target.value } }))}
                  className={inputCls} placeholder={t.settings.modelPh} />
              </div>
              <div>
                <label className={labelCls}>{t.settings.prompt}</label>
                <textarea value={settings.ai.prompt}
                  onChange={e => onUpdate(p => ({ ...p, ai: { ...p.ai, prompt: e.target.value } }))}
                  rows={3} className={`${inputCls} resize-none`} placeholder={t.settings.promptPh} />
              </div>
            </>
          )}

          {tab === 'aiButtons' && (
            <>
              {editingBtn ? (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {editingBtn.id && settings.ai.aiButtons.find(b => b.id === editingBtn.id) ? t.settings.editAiButton : t.settings.addAiButton}
                  </h3>
                  <div className="grid grid-cols-[80px_1fr] gap-3 items-start">
                    <div>
                      <label className={labelCls}>{t.settings.btnIcon}</label>
                      <input type="text" value={draftBtn.icon}
                        onChange={e => setDraftBtn(p => ({ ...p, icon: e.target.value }))}
                        className={`${inputCls} text-center text-lg`} maxLength={4} />
                    </div>
                    <div>
                      <label className={labelCls}>{t.settings.btnLabel}</label>
                      <input type="text" value={draftBtn.label}
                        onChange={e => setDraftBtn(p => ({ ...p, label: e.target.value }))}
                        className={inputCls} placeholder={t.settings.btnLabelPh} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{t.settings.btnPrompt}</label>
                    <textarea value={draftBtn.prompt}
                      onChange={e => setDraftBtn(p => ({ ...p, prompt: e.target.value }))}
                      rows={3} className={`${inputCls} resize-none`} placeholder={t.settings.btnPromptPh} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    {editingBtn.id && settings.ai.aiButtons.find(b => b.id === editingBtn.id) && (
                      <button onClick={() => deleteAiButton(editingBtn.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        {t.settings.delete}
                      </button>
                    )}
                    <button onClick={() => setEditingBtn(null)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      {t.settings.cancel}
                    </button>
                    <button onClick={saveAiButton}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                      {t.settings.save}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={startNew}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                  + {t.settings.addAiButton}
                </button>
              )}

              <div className="space-y-2">
                {settings.ai.aiButtons.length === 0 && !editingBtn && (
                  <p className="text-center text-xs text-gray-300 py-4">{t.settings.noAiButtons}</p>
                )}
                {settings.ai.aiButtons.map(btn => (
                  <div key={btn.id} onClick={() => startEdit(btn)}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all">
                    <span className="text-lg w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg">{btn.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700">{btn.label}</div>
                      <div className="text-xs text-gray-400 truncate">{btn.prompt}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium transition-colors shadow-sm">
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
}
