import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, Rect, Annotation, AnnotationTool } from '../types';

type ResizeEdge = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

interface ScreenshotCanvasProps {
  image: string | null;
  selection: Rect | null;
  annotations: Annotation[];
  currentAnnotation: Annotation | null;
  currentTool: AnnotationTool;
  currentColor: string;
  currentSize: number;
  onSelectionChange: (selection: Rect | null) => void;
  onSelectionComplete: () => void;
  onStartAnnotation: (tool: AnnotationTool, point: Point, color: string, size: number) => void;
  onUpdateAnnotation: (point: Point) => void;
  onFinishAnnotation: () => void;
  onAddTextAnnotation: (point: Point, text: string, color: string, size: number) => void;
}

export function ScreenshotCanvas({
  image,
  selection,
  annotations,
  currentAnnotation,
  currentTool,
  currentColor,
  currentSize,
  onSelectionChange,
  onSelectionComplete,
  onStartAnnotation,
  onUpdateAnnotation,
  onFinishAnnotation,
  onAddTextAnnotation,
}: ScreenshotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [cursorStyle, setCursorStyle] = useState('crosshair');
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ point: Point; sel: Rect } | null>(null);

  const detectEdge = useCallback((x: number, y: number, sel: Rect): ResizeEdge => {
    const edge = 8;
    const onLeft = Math.abs(x - sel.x) < edge;
    const onRight = Math.abs(x - (sel.x + sel.width)) < edge;
    const onTop = Math.abs(y - sel.y) < edge;
    const onBottom = Math.abs(y - (sel.y + sel.height)) < edge;

    if (onTop && onLeft) return 'top-left';
    if (onTop && onRight) return 'top-right';
    if (onBottom && onLeft) return 'bottom-left';
    if (onBottom && onRight) return 'bottom-right';
    if (onLeft) return 'left';
    if (onRight) return 'right';
    if (onTop) return 'top';
    if (onBottom) return 'bottom';
    return null;
  }, []);

  const edgeToCursor: Record<string, string> = {
    'left': 'ew-resize', 'right': 'ew-resize',
    'top': 'ns-resize', 'bottom': 'ns-resize',
    'top-left': 'nwse-resize', 'bottom-right': 'nwse-resize',
    'top-right': 'nesw-resize', 'bottom-left': 'nesw-resize',
  };

  // Draw image and annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (selection && selection.width > 0 && selection.height > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.rect(selection.x, selection.y + selection.height, selection.width, -selection.height);
        ctx.fill('evenodd');

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);

        // Draw resize handles
        const hs = 6;
        const corners = [
          [selection.x, selection.y],
          [selection.x + selection.width, selection.y],
          [selection.x, selection.y + selection.height],
          [selection.x + selection.width, selection.y + selection.height],
        ];
        ctx.fillStyle = '#00ff00';
        for (const [cx, cy] of corners) {
          ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
        }
      }

      annotations.forEach(a => drawAnnotation(ctx, a));
      if (currentAnnotation) drawAnnotation(ctx, currentAnnotation);
    };
    img.src = `data:image/png;base64,${image}`;
  }, [image, selection, annotations, currentAnnotation]);

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = annotation.size;

    switch (annotation.tool) {
      case 'rectangle':
        if (annotation.points.length >= 2) {
          const s = annotation.points[0], e = annotation.points[annotation.points.length - 1];
          ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
        }
        break;
      case 'arrow':
        if (annotation.points.length >= 2) {
          const s = annotation.points[0], e = annotation.points[annotation.points.length - 1];
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
          const angle = Math.atan2(e.y - s.y, e.x - s.x), hl = 15;
          ctx.beginPath(); ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x - hl * Math.cos(angle - Math.PI / 6), e.y - hl * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x - hl * Math.cos(angle + Math.PI / 6), e.y - hl * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
        break;
      case 'text':
        if (annotation.text && annotation.points.length >= 1) {
          ctx.font = `${annotation.size * 4}px Arial`;
          ctx.fillText(annotation.text, annotation.points[0].x, annotation.points[0].y);
        }
        break;
      case 'mosaic':
        if (annotation.points.length >= 2) {
          const s = annotation.points[0], e = annotation.points[annotation.points.length - 1];
          const w = Math.abs(e.x - s.x), h = Math.abs(e.y - s.y);
          const id = ctx.getImageData(Math.min(s.x, e.x), Math.min(s.y, e.y), w, h);
          const bs = 10;
          for (let y = 0; y < h; y += bs) {
            for (let x = 0; x < w; x += bs) {
              const i = (y * w + x) * 4;
              ctx.fillStyle = `rgb(${id.data[i]},${id.data[i + 1]},${id.data[i + 2]})`;
              ctx.fillRect(Math.min(s.x, e.x) + x, Math.min(s.y, e.y) + y, bs, bs);
            }
          }
        }
        break;
      case 'highlight':
        if (annotation.points.length >= 2) {
          const s = annotation.points[0], e = annotation.points[annotation.points.length - 1];
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fillRect(s.x, s.y, e.x - s.x, e.y - s.y);
        }
        break;
    }
  };

  const applyResize = useCallback((edge: ResizeEdge, dx: number, dy: number, origSel: Rect): Rect => {
    let { x, y, width, height } = origSel;
    if (edge === 'left' || edge === 'top-left' || edge === 'bottom-left') { x += dx; width -= dx; }
    if (edge === 'right' || edge === 'top-right' || edge === 'bottom-right') { width += dx; }
    if (edge === 'top' || edge === 'top-left' || edge === 'top-right') { y += dy; height -= dy; }
    if (edge === 'bottom' || edge === 'bottom-left' || edge === 'bottom-right') { height += dy; }
    if (width < 1) width = 1;
    if (height < 1) height = 1;
    return { x, y, width, height };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selection) {
      const edge = detectEdge(x, y, selection);
      if (edge) {
        setIsResizing(true);
        setResizeEdge(edge);
        setResizeStart({ point: { x, y }, sel: { ...selection } });
        return;
      }
    }

    if (!selection) {
      setIsDrawing(true);
      setStartPoint({ x, y });
      onSelectionChange({ x, y, width: 0, height: 0 });
    } else {
      onStartAnnotation(currentTool, { x, y }, currentColor, currentSize);
    }
  }, [selection, currentTool, currentColor, currentSize, onSelectionChange, onStartAnnotation, detectEdge]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && resizeEdge && resizeStart) {
      const dx = x - resizeStart.point.x;
      const dy = y - resizeStart.point.y;
      onSelectionChange(applyResize(resizeEdge, dx, dy, resizeStart.sel));
      return;
    }

    if (isDrawing && startPoint) {
      onSelectionChange({
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y),
      });
    } else if (selection) {
      const edge = detectEdge(x, y, selection);
      setCursorStyle(edge ? edgeToCursor[edge] : 'crosshair');
      onUpdateAnnotation({ x, y });
    }
  }, [isDrawing, startPoint, selection, isResizing, resizeEdge, resizeStart, onSelectionChange, onUpdateAnnotation, detectEdge, applyResize]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeEdge(null);
      setResizeStart(null);
      return;
    }
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      onSelectionComplete();
    } else if (selection) {
      onFinishAnnotation();
    }
  }, [isDrawing, isResizing, selection, onFinishAnnotation, onSelectionComplete]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'text' && selection) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const text = prompt('Enter text:');
      if (text) onAddTextAnnotation({ x, y }, text, currentColor, currentSize);
    }
  }, [currentTool, selection, currentColor, currentSize, onAddTextAnnotation]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full object-contain"
      style={{ cursor: cursorStyle }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
}
