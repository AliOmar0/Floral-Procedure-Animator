import React from "react";
import { motion } from "framer-motion";

export const Rose = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-50 -50 100 100" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Stem and thorns */}
        <motion.path d="M0,15 Q-5,35 0,50" pathLength={progress} />
        <motion.path d="M-2,25 L-6,23 L-3,28" pathLength={progress} strokeWidth="1" />
        <motion.path d="M1,35 L5,33 L3,38" pathLength={progress} strokeWidth="1" />
        
        {/* Leaves */}
        <motion.path d="M-2,30 Q-20,25 -25,15 Q-15,35 -2,30" pathLength={progress} />
        <motion.path d="M0,40 Q20,35 25,25 Q15,45 0,40" pathLength={progress} />

        {/* Inner spiral */}
        <motion.path d="M0,0 C-5,-5 5,-10 10,0 C15,10 -10,15 -15,0 C-20,-15 15,-25 20,0 C25,25 -20,30 -25,0 C-30,-30 25,-40 30,0" pathLength={progress} />
      </motion.g>
    </svg>
  );
};
