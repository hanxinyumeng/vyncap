import { useState, useCallback } from 'react';
import { Annotation, AnnotationTool, Point } from '../types';
import { useHistory } from './useHistory';

export function useAnnotation() {
  const { currentState: annotations, pushState, undo, redo, canUndo, canRedo } = useHistory([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);

  const startAnnotation = useCallback((tool: AnnotationTool, point: Point, color: string, size: number) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      tool,
      points: [point],
      color,
      size,
    };
    setCurrentAnnotation(newAnnotation);
  }, []);

  const updateAnnotation = useCallback((point: Point) => {
    if (!currentAnnotation) return;
    
    setCurrentAnnotation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  }, [currentAnnotation]);

  const finishAnnotation = useCallback(() => {
    if (!currentAnnotation) return;
    
    pushState([...annotations, currentAnnotation]);
    setCurrentAnnotation(null);
  }, [currentAnnotation, annotations, pushState]);

  const addTextAnnotation = useCallback((point: Point, text: string, color: string, size: number) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      tool: 'text',
      points: [point],
      color,
      size,
      text,
    };
    pushState([...annotations, newAnnotation]);
  }, [annotations, pushState]);

  return {
    annotations,
    currentAnnotation,
    startAnnotation,
    updateAnnotation,
    finishAnnotation,
    addTextAnnotation,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
