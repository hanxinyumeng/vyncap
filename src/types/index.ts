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

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
}
