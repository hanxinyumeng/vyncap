export const zh = {
  app: { title: 'Vyncap', subtitle: '截图 → AI 分析' },
  home: {
    capture: '开始截图',
    settings: '设置',
    shortcut: '快捷键',
    apiKeyWarning: '请先在设置中配置 API Key',
  },
  toolbar: {
    copy: '复制', save: '保存', cancel: '取消', pin: '钉图',     ai: 'AI 分析',
    undo: '撤销', redo: '重做',
    rect: '矩形', arrow: '箭头', text: '文字', mosaic: '马赛克', highlight: '高亮',
  },
  ai: {
    title: 'AI 解答',
    analyzing: '正在分析截图...',
    noKey: '请先配置 API Key',
  },
  settings: {
    title: '设置',
    tabs: { ai: 'AI 配置', shortcuts: '快捷键', aiButtons: 'AI 按钮', toolbar: '工具栏', general: '通用' },
    apiUrl: 'API 地址', apiUrlPh: 'https://api.openai.com/v1',
    apiKey: 'API Key', apiKeyPh: 'sk-...',
    model: '模型名称', modelPh: 'gpt-4o',
    prompt: '提示词', promptPh: '请根据截图内容回答问题...',
    captureShortcut: '截图快捷键',
    recordBtn: '修改', recording: '按下快捷键...',
    shortcutHint: '点击「修改」后按下新的快捷键组合，需包含 Ctrl/Alt/Shift 修饰键。',
    language: '语言',
    addAiButton: '添加 AI 按钮',
    editAiButton: '编辑 AI 按钮',
    btnLabel: '按钮名称', btnLabelPh: '如：翻译',
    btnIcon: '图标', btnIconPh: '输入 emoji',
    btnPrompt: '提示词', btnPromptPh: '请将截图中的文字翻译为英文...',
    delete: '删除', save: '保存', cancel: '取消',
    done: '完成',
    toolbarVisible: '显示的按钮',
    toolbarHint: '勾选要在截图工具栏中显示的按钮',
    noAiButtons: '暂无自定义 AI 按钮，点击上方添加',
  },
} as const;

export const en = {
  app: { title: 'Vyncap', subtitle: 'Capture → AI Analyze' },
  home: {
    capture: 'Capture',
    settings: 'Settings',
    shortcut: 'Shortcut',
    apiKeyWarning: 'Please configure your API Key in Settings first',
  },
  toolbar: {
    copy: 'Copy', save: 'Save', cancel: 'Cancel', pin: 'Pin', ai: 'AI Answer',
    undo: 'Undo', redo: 'Redo',
    rect: 'Rectangle', arrow: 'Arrow', text: 'Text', mosaic: 'Mosaic', highlight: 'Highlight',
  },
  ai: {
    title: 'AI Answer',
    analyzing: 'Analyzing screenshot...',
    noKey: 'Please configure API Key first',
  },
  settings: {
    title: 'Settings',
    tabs: { ai: 'AI Config', shortcuts: 'Shortcuts', aiButtons: 'AI Buttons', toolbar: 'Toolbar', general: 'General' },
    apiUrl: 'API URL', apiUrlPh: 'https://api.openai.com/v1',
    apiKey: 'API Key', apiKeyPh: 'sk-...',
    model: 'Model', modelPh: 'gpt-4o',
    prompt: 'Prompt', promptPh: 'Please answer based on the screenshot...',
    captureShortcut: 'Capture Shortcut',
    recordBtn: 'Change', recording: 'Press keys...',
    shortcutHint: 'Click "Change" then press a new key combo (must include Ctrl/Alt/Shift).',
    language: 'Language',
    addAiButton: 'Add AI Button',
    editAiButton: 'Edit AI Button',
    btnLabel: 'Label', btnLabelPh: 'e.g. Translate',
    btnIcon: 'Icon', btnIconPh: 'Enter emoji',
    btnPrompt: 'Prompt', btnPromptPh: 'Translate the text in the screenshot to English...',
    delete: 'Delete', save: 'Save', cancel: 'Cancel',
    done: 'Done',
    toolbarVisible: 'Visible Buttons',
    toolbarHint: 'Select buttons to show in the screenshot toolbar',
    noAiButtons: 'No custom AI buttons yet, click above to add one',
  },
} as const;

export type Locale = typeof zh;
export type Lang = 'zh' | 'en';
export const locales: Record<Lang, any> = { zh, en };
