import React, { useState, useEffect, useRef } from "react";
import { Sketch, SketchRef } from "./components/Sketch";
import { ControlPanel } from "./components/ControlPanel";
import { SketchParams } from "./sketch/types";
import { FLOWER_PRESETS } from "./sketch/flowers";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DEFAULT_PARAMS: SketchParams = {
  flowerIndex: 0,
  bloomSpeed: 0.006,
  wiltSpeed: 0.04,
  interactiveDuration: 25,
  modeCycleInterval: 0.8,
  forcedRenderMode: 'auto',
  densityMin: 4,
  densityMax: 20,
  autoRotate: true,
  rotationSpeed: 1.0,
  mouseInfluence: 1.0,
  bouquet: false,
  glitchEnabled: true,
  glitchFrequency: 1.0,
  glitchIntensity: 1.0,
  asciiCharSet: 'letters',
  bgColor: [0, 0, 0],
  paused: false,
  hideUI: false,
  customColors: null,
};

function App() {
  const [params, setParams] = useState<SketchParams>(DEFAULT_PARAMS);
  const [phase, setPhase] = useState<string>("loading");
  const [loadingPct, setLoadingPct] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const sketchRef = useRef<SketchRef>(null);

  const flower = FLOWER_PRESETS[params.flowerIndex % FLOWER_PRESETS.length];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          setParams(p => ({ ...p, paused: !p.paused }));
          break;
        case 'h':
          setParams(p => ({ ...p, hideUI: !p.hideUI }));
          break;
        case 'g':
          sketchRef.current?.triggerGlitch();
          break;
        case 'r':
          sketchRef.current?.restartBloom();
          break;
        case 's':
          sketchRef.current?.captureFrame();
          break;
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'arrowleft':
          setParams(p => ({ ...p, flowerIndex: (p.flowerIndex - 1 + FLOWER_PRESETS.length) % FLOWER_PRESETS.length }));
          break;
        case 'arrowright':
          setParams(p => ({ ...p, flowerIndex: (p.flowerIndex + 1) % FLOWER_PRESETS.length }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRandomize = () => {
    setParams(p => ({
      ...p,
      flowerIndex: Math.floor(Math.random() * FLOWER_PRESETS.length),
      bloomSpeed: Math.random() * 0.04 + 0.002,
      wiltSpeed: Math.random() * 0.15 + 0.01,
      interactiveDuration: Math.floor(Math.random() * 40) + 10,
      modeCycleInterval: Math.random() > 0.3 ? Math.random() * 3 + 0.5 : 0,
      forcedRenderMode: ['auto', 'ascii', 'dots', 'pixels'][Math.floor(Math.random() * 4)] as any,
      densityMin: Math.floor(Math.random() * 10) + 4,
      densityMax: Math.floor(Math.random() * 15) + 10,
      autoRotate: Math.random() > 0.2,
      rotationSpeed: Math.random() * 2,
      mouseInfluence: Math.random() * 2,
      glitchEnabled: Math.random() > 0.3,
      glitchFrequency: Math.random() * 2 + 0.1,
      glitchIntensity: Math.random() * 2 + 0.1,
      asciiCharSet: ['letters', 'binary', 'symbols', 'blocks'][Math.floor(Math.random() * 4)] as any,
      customColors: null
    }));
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-sans select-none">
      <Sketch 
        ref={sketchRef}
        params={params} 
        onPhaseChange={setPhase}
        onProgress={setLoadingPct}
        onReady={() => {
          setIsReady(true);
          setPhase('growing');
        }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="font-mono text-white/70 tracking-[4px] text-sm mb-6">LOADING</div>
            <div className="w-[180px] h-[3px] bg-zinc-900 rounded-sm overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-rose-400 to-pink-300"
                initial={{ width: 0 }}
                animate={{ width: `${loadingPct}%` }}
                transition={{ type: "tween", ease: "linear", duration: 0.1 }}
              />
            </div>
            <div className="mt-3 font-mono text-zinc-500 text-[11px]">{loadingPct}%</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <AnimatePresence>
        {isReady && !params.hideUI && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Flower Name Display */}
            <div className="absolute bottom-10 left-10 text-white/90 drop-shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={params.flowerIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="font-serif text-5xl md:text-7xl italic tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 pb-2">
                    {flower.name}
                  </h1>
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-3 mt-2 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="font-mono text-xs tracking-[0.3em] uppercase">{phase}</span>
              </div>
            </div>

            {/* Control Panel Container */}
            <div className="absolute top-6 right-6 bottom-6 pointer-events-auto flex items-start justify-end">
              <ControlPanel 
                params={params} 
                setParams={setParams} 
                onGlitch={() => sketchRef.current?.triggerGlitch()}
                onRestart={() => sketchRef.current?.restartBloom()}
                onForceWilt={() => sketchRef.current?.forceWilt()}
                onSave={() => sketchRef.current?.captureFrame()}
                onRandomize={handleRandomize}
                onReset={() => setParams(DEFAULT_PARAMS)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show UI toggle when hidden */}
      <AnimatePresence>
        {isReady && params.hideUI && (
          <motion.div 
            className="absolute top-6 right-6 z-50 pointer-events-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button 
              variant="outline" 
              size="icon" 
              data-testid="button-show-ui"
              className="bg-black/20 backdrop-blur-md border-white/20 text-white/70 hover:text-white hover:bg-black/40 rounded-full w-10 h-10"
              onClick={() => setParams(p => ({ ...p, hideUI: false }))}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
