import { Lang } from '../i18n/locales';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnnotationTool = 'rectangle' | 'arrow' | 'text' | 'mosaic' | 'highlight';

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  points: Point[];
  color: string;
  size: number;
  text?: string;
  rect?: Rect;
}

export interface ScreenshotState {
  image: string | null;
  selection: Rect | null;
  annotations: Annotation[];
  currentTool: AnnotationTool;
  currentColor: string;
  currentSize: number;
  history: Annotation[][];
  historyIndex: number;
}

export interface AIButton {
  id: string;
  label: string;
  icon: string;
  iconType?: 'emoji' | 'image';
  prompt: string;
}

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
  aiButtons: AIButton[];
}

export interface ShortcutsConfig {
  capture: string;
}

export type ToolbarActionId = 'copy' | 'save' | 'cancel' | 'pin';

export interface AppSettings {
  language: Lang;
  ai: AIConfig;
  shortcuts: ShortcutsConfig;
  toolbarButtons: ToolbarActionId[];
}

export const DEFAULT_AI_BUTTONS: AIButton[] = [
  { id: 'default', label: '分析', icon: '🔍', prompt: '请分析截图内容，给出详细解答。' },
  { id: 'solve', label: '解题', icon: '/icons/solve.png', iconType: 'image', prompt: '图片中是一道题目，请先给出这道题的答案，随后给出详细解答。' },
  { id: 'ocr', label: 'OCR', icon: '/icons/filled_OCR.png', iconType: 'image', prompt: '请提取出图片中的文字。' },
];

export const DEFAULT_TOOLBAR_BUTTONS: ToolbarActionId[] = ['copy', 'save', 'cancel', 'pin'];

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh',
  ai: {
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    prompt: '请分析截图内容，给出详细解答。',
    aiButtons: DEFAULT_AI_BUTTONS,
  },
  shortcuts: { capture: 'Ctrl+Alt+A' },
  toolbarButtons: DEFAULT_TOOLBAR_BUTTONS,
};
