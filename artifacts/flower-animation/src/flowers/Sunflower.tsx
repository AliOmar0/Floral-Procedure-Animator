import React from "react";
import { motion } from "framer-motion";

export const Sunflower = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-60 -60 120 120" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Stem */}
        <motion.path d="M0,20 Q0,40 5,60" pathLength={progress} />
        {/* Center Seeds (simplified to crosshatch pattern) */}
        <motion.circle cx="0" cy="0" r="15" pathLength={progress} />
        <motion.path d="M-10,-10 L10,10 M0,-14 L0,14 M10,-10 L-10,10" pathLength={progress} strokeWidth="0.5" />
        {/* Petals around the center */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = Math.cos(angle) * 15;
          const y1 = Math.sin(angle) * 15;
          const x2 = Math.cos(angle) * 45;
          const y2 = Math.sin(angle) * 45;
          return (
            <motion.path
              key={i}
              d={`M${x1},${y1} L${x2},${y2} Q${x2 + 10},${y2 + 10} ${x1},${y1}`}
              pathLength={progress}
            />
          );
        })}
      </motion.g>
    </svg>
  );
};
