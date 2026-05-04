import React from "react";
import { motion } from "framer-motion";

export const Peony = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-50 -50 100 100" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Stem */}
        <motion.path d="M0,10 Q5,30 0,50" pathLength={progress} />
        {/* Leaves */}
        <motion.path d="M2,30 Q20,30 30,20 Q15,40 2,30" pathLength={progress} />
        <motion.path d="M-1,35 Q-20,40 -25,30 Q-15,20 -1,35" pathLength={progress} />
        
        {/* Center */}
        <motion.path d="M-5,-5 Q0,-10 5,-5 Q10,0 5,5 Q0,10 -5,5 Q-10,0 -5,-5" pathLength={progress} />
        
        {/* Inner petals */}
        <motion.path d="M-5,-5 C-15,-20 0,-25 5,-5" pathLength={progress} />
        <motion.path d="M5,-5 C25,-10 20,10 5,5" pathLength={progress} />
        <motion.path d="M5,5 C10,25 -10,20 -5,5" pathLength={progress} />
        <motion.path d="M-5,5 C-20,15 -25,-10 -5,-5" pathLength={progress} />

        {/* Outer petals */}
        <motion.path d="M-8,-8 C-30,-30 10,-40 10,-8" pathLength={progress} />
        <motion.path d="M10,-8 C35,-15 35,20 8,8" pathLength={progress} />
        <motion.path d="M8,8 C15,35 -20,35 -8,8" pathLength={progress} />
        <motion.path d="M-8,8 C-35,15 -35,-20 -8,-8" pathLength={progress} />
      </motion.g>
    </svg>
  );
};
