import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Rect } from '../types';

interface ScreenshotCanvasProps {
  image: string | null;
  selection: Rect | null;
  onSelectionChange: (selection: Rect | null) => void;
  onSelectionComplete: () => void;
}

export function ScreenshotCanvas({
  image,
  selection,
  onSelectionChange,
  onSelectionComplete,
}: ScreenshotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

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
      }
    };
    img.src = `data:image/png;base64,${image}`;
  }, [image, selection]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPoint({ x, y });
    onSelectionChange({ x, y, width: 0, height: 0 });
  }, [onSelectionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onSelectionChange({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    });
  }, [isDrawing, startPoint, onSelectionChange]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      onSelectionComplete();
    }
  }, [isDrawing, onSelectionComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full object-contain"
      style={{ cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
