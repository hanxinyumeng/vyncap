import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, Rect, Annotation, AnnotationTool } from '../types';

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

  // Draw image and annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw dimmed overlay outside selection
      if (selection && selection.width > 0 && selection.height > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.rect(selection.x, selection.y + selection.height, selection.width, -selection.height);
        ctx.fill('evenodd');

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      }

      // Draw annotations
      annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation);
      });

      // Draw current annotation
      if (currentAnnotation) {
        drawAnnotation(ctx, currentAnnotation);
      }
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
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
        break;

      case 'arrow':
        if (annotation.points.length >= 2) {
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          
          // Draw line
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const headLength = 15;
          
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6)
          );
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
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          const width = Math.abs(end.x - start.x);
          const height = Math.abs(end.y - start.y);
          
          // Simple pixelation effect
          const imageData = ctx.getImageData(
            Math.min(start.x, end.x),
            Math.min(start.y, end.y),
            width,
            height
          );
          
          const blockSize = 10;
          for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
              const index = (y * width + x) * 4;
              const r = imageData.data[index];
              const g = imageData.data[index + 1];
              const b = imageData.data[index + 2];
              
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(
                Math.min(start.x, end.x) + x,
                Math.min(start.y, end.y) + y,
                blockSize,
                blockSize
              );
            }
          }
        }
        break;

      case 'highlight':
        if (annotation.points.length >= 2) {
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
        break;
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!selection) {
      // Start selection
      setIsDrawing(true);
      setStartPoint({ x, y });
      onSelectionChange({ x, y, width: 0, height: 0 });
    } else {
      // Start annotation
      onStartAnnotation(currentTool, { x, y }, currentColor, currentSize);
    }
  }, [selection, currentTool, currentColor, currentSize, onSelectionChange, onStartAnnotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && startPoint) {
      // Update selection
      const newSelection: Rect = {
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y),
      };
      onSelectionChange(newSelection);
    } else if (selection) {
      // Update annotation
      onUpdateAnnotation({ x, y });
    }
  }, [isDrawing, startPoint, selection, onSelectionChange, onUpdateAnnotation]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      onSelectionComplete();
    } else if (selection) {
      onFinishAnnotation();
    }
  }, [isDrawing, selection, onFinishAnnotation, onSelectionComplete]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'text' && selection) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const text = prompt('Enter text:');
      if (text) {
        onAddTextAnnotation({ x, y }, text, currentColor, currentSize);
      }
    }
  }, [currentTool, selection, currentColor, currentSize, onAddTextAnnotation]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full object-contain"
      style={{ cursor: selection ? 'crosshair' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
}