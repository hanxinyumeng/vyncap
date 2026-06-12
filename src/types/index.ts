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

export type AnnotationTool =
  | "rectangle"
  | "arrow"
  | "text"
  | "mosaic"
  | "highlight";

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  color: string;
  lineWidth: number;
  points: Point[];
  text?: string;
  rect?: Rect;
}

export interface ScreenshotState {
  isCapturing: boolean;
  screenshotData: string | null;
  annotations: Annotation[];
  selectedTool: AnnotationTool;
  selectedColor: string;
  lineWidth: number;
  history: Annotation[][];
  historyIndex: number;
}
