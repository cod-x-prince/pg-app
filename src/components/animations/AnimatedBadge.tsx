/**
 * AnimatedBadge Component
 * Badge with bounce animation (for notification counts)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { bounceVariants, shouldAnimate } from "@/lib/animations/config";

interface AnimatedBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export default function AnimatedBadge({ 
  count, 
  max = 99, 
  className = "" 
}: AnimatedBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        variants={shouldAnimate() ? bounceVariants : undefined}
        initial="initial"
        animate="animate"
        exit={{ scale: 0, opacity: 0 }}
        className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 ${className}`}
      >
        {displayCount}
      </motion.span>
    </AnimatePresence>
  );
}
