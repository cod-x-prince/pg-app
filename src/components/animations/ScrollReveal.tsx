/**
 * ScrollReveal Component
 * Animates children when they enter viewport
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollReveal } from "@/lib/animations/hooks";
import {
  fadeUpVariants,
  fadeInVariants,
  scaleUpVariants,
  shouldAnimate,
} from "@/lib/animations/config";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-in" | "scale-up";
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  threshold = 0.2,
  triggerOnce = true,
  className = "",
}: ScrollRevealProps) {
  const { ref, isInView } = useScrollReveal({ threshold, triggerOnce });

  // If animations are disabled, render without motion
  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  // Select variant based on prop
  const getVariants = () => {
    switch (variant) {
      case "fade-up":
        return fadeUpVariants;
      case "fade-in":
        return fadeInVariants;
      case "scale-up":
        return scaleUpVariants;
      default:
        return fadeUpVariants;
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
