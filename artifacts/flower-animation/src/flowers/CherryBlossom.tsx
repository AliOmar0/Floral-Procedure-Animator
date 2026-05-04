import React from "react";
import { motion } from "framer-motion";

export const CherryBlossom = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-50 -50 100 100" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Stem */}
        <motion.path
          d="M0,0 Q-10,30 -5,50"
          pathLength={progress}
        />
        {/* Branch left */}
        <motion.path
          d="M-2,20 Q-20,15 -30,10"
          pathLength={progress}
        />
        {/* Branch right */}
        <motion.path
          d="M-4,35 Q10,30 20,40"
          pathLength={progress}
        />
        {/* Main Petals */}
        <motion.path d="M0,0 Q10,-10 0,-20 Q-10,-10 0,0" pathLength={progress} />
        <motion.path d="M0,0 Q15,-5 20,5 Q10,10 0,0" pathLength={progress} />
        <motion.path d="M0,0 Q10,15 0,20 Q-10,15 0,0" pathLength={progress} />
        <motion.path d="M0,0 Q-15,10 -20,0 Q-15,-10 0,0" pathLength={progress} />
        <motion.path d="M0,0 Q-10,-15 -5,-25 Q5,-15 0,0" pathLength={progress} />
        {/* Inner details */}
        <motion.path d="M0,0 L3,-5 M0,0 L-3,-4 M0,0 L2,4 M0,0 L-2,3" strokeWidth="0.5" pathLength={progress} />
      </motion.g>
    </svg>
  );
};
