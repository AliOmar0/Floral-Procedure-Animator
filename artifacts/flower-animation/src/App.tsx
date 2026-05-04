import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Flowers from "@/flowers";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const FLOWER_DATA = [
  { id: "peony", name: "Peony", Component: Flowers.Peony, color: "#fca5a5" },
  { id: "rose", name: "Rose", Component: Flowers.Rose, color: "#ef4444" },
  { id: "cherry_blossom", name: "Cherry Blossom", Component: Flowers.CherryBlossom, color: "#fbcfe8" },
  { id: "lotus", name: "Lotus", Component: Flowers.Lotus, color: "#d8b4fe" },
  { id: "sunflower", name: "Sunflower", Component: Flowers.Sunflower, color: "#fcd34d" },
  { id: "tulip", name: "Tulip", Component: Flowers.Tulip, color: "#c084fc" },
];

function Home() {
  const [selectedId, setSelectedId] = useState(FLOWER_DATA[0].id);
  const [animationKey, setAnimationKey] = useState(0);
  const [progress, setProgress] = useState(0);

  const selectedFlower = FLOWER_DATA.find((f) => f.id === selectedId) || FLOWER_DATA[0];

  useEffect(() => {
    // Reset and start animation
    setProgress(0);
    let start = performance.now();
    const duration = 4000;

    let frameId: number;
    const animate = (time: number) => {
      const elapsed = time - start;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easedT = 1 - Math.pow(1 - t, 3);
      setProgress(easedT);

      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [selectedId, animationKey]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-zinc-100 overflow-hidden relative selection:bg-zinc-800">
      
      {/* Background ambient glow based on flower color */}
      <motion.div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{ backgroundColor: selectedFlower.color }}
        transition={{ duration: 2 }}
        style={{ filter: "blur(100px)" }}
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=0 0 200 200 xmlns=http://www.w3.org/2000/svg%3E%3Cfilter id=noiseFilter%3E%3CfeTurbulence type=fractalNoise baseFrequency=0.65 numOctaves=3 stitchTiles=stitch/%3E%3C/filter%3E%3Crect width=100%25 height=100%25 filter=url(%23noiseFilter)/%3E%3C/svg%3E')" }}></div>

      {/* Main Canvas */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative max-w-4xl px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedId}-${animationKey}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[400px] aspect-square relative"
          >
            <selectedFlower.Component progress={progress} color={selectedFlower.color} />
          </motion.div>
        </AnimatePresence>

        {/* Flower Name Title */}
        <motion.h1 
          className="font-serif text-4xl md:text-6xl tracking-wide mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: progress > 0.8 ? 1 : 0, y: progress > 0.8 ? 0 : 20 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ color: selectedFlower.color }}
        >
          {selectedFlower.name}
        </motion.h1>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl px-6 pb-12 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl">
          <div className="flex flex-wrap justify-center gap-2">
            {FLOWER_DATA.map((flower) => (
              <button
                key={flower.id}
                onClick={() => setSelectedId(flower.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedId === flower.id 
                    ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
                }`}
                style={{ 
                  color: selectedId === flower.id ? flower.color : undefined,
                  borderColor: selectedId === flower.id ? flower.color : "transparent"
                }}
              >
                {flower.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAnimationKey(k => k + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors border border-white/5 hover:border-white/20 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
