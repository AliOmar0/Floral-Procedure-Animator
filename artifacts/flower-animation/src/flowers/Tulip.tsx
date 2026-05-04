import React from "react";
import { motion } from "framer-motion";

export const Tulip = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-50 -50 100 100" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Stem */}
        <motion.path d="M0,15 Q-5,35 0,50" pathLength={progress} />
        {/* Long Leaves */}
        <motion.path d="M-2,30 Q-20,10 -25,-10 Q-10,20 -2,30" pathLength={progress} />
        <motion.path d="M2,40 Q25,20 30,-5 Q15,30 2,40" pathLength={progress} />
        {/* Tulip Cup */}
        <motion.path d="M-15,15 C-30,-10 -15,-30 0,-40 C15,-30 30,-10 15,15 Z" pathLength={progress} />
        {/* Inner petal folds */}
        <motion.path d="M-5,15 Q-10,-10 -5,-35" pathLength={progress} />
        <motion.path d="M5,15 Q10,-10 5,-35" pathLength={progress} />
      </motion.g>
    </svg>
  );
};
