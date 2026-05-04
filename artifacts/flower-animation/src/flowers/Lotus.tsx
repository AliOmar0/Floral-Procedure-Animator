import React from "react";
import { motion } from "framer-motion";

export const Lotus = ({ progress, color }: { progress: number, color: string }) => {
  return (
    <svg viewBox="-60 -60 120 120" className="w-full h-full overflow-visible">
      <motion.g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Center petal */}
        <motion.path d="M0,10 C15,-10 10,-40 0,-50 C-10,-40 -15,-10 0,10" pathLength={progress} />
        {/* Left inner */}
        <motion.path d="M0,10 C-10,0 -20,-20 -15,-40 C-5,-30 0,-10 0,10" pathLength={progress} />
        {/* Right inner */}
        <motion.path d="M0,10 C10,0 20,-20 15,-40 C5,-30 0,-10 0,10" pathLength={progress} />
        {/* Left outer */}
        <motion.path d="M0,10 C-20,10 -40,-10 -35,-30 C-15,-20 -5,0 0,10" pathLength={progress} />
        {/* Right outer */}
        <motion.path d="M0,10 C20,10 40,-10 35,-30 C15,-20 5,0 0,10" pathLength={progress} />
        {/* Bottom leaf */}
        <motion.path d="M-40,15 C-20,30 20,30 40,15 C20,20 -20,20 -40,15" pathLength={progress} />
      </motion.g>
    </svg>
  );
};
