import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import p5 from 'p5';
import { createPeoniaSketch } from '../sketch/peoniaSketch';
import { SketchParams } from '../sketch/types';

export interface SketchRef {
  triggerGlitch: () => void;
  restartBloom: () => void;
  forceWilt: () => void;
  captureFrame: () => void;
}

interface SketchProps {
  params: SketchParams;
  onPhaseChange?: (phase: string) => void;
  onReady?: () => void;
  onProgress?: (pct: number) => void;
}

export const Sketch = forwardRef<SketchRef, SketchProps>(({ params, onPhaseChange, onReady, onProgress }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const sketchFunc = createPeoniaSketch(
      () => paramsRef.current,
      {
        onPhaseChange: (p) => onPhaseChange?.(p),
        onReady: () => onReady?.(),
        onProgress: (p) => onProgress?.(p),
      }
    );

    p5Instance.current = new p5(sketchFunc, containerRef.current);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerGlitch: () => {
      if (p5Instance.current) {
        (p5Instance.current as any).triggerGlitch?.();
      }
    },
    restartBloom: () => {
      if (p5Instance.current) {
        (p5Instance.current as any).restartBloom?.();
      }
    },
    forceWilt: () => {
      if (p5Instance.current) {
        (p5Instance.current as any).forceWilt?.();
      }
    },
    captureFrame: () => {
      if (p5Instance.current) {
        p5Instance.current.saveCanvas('peonia', 'png');
      }
    }
  }));

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ overflow: 'hidden' }}
    />
  );
});

Sketch.displayName = "Sketch";
