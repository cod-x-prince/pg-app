/**
 * StaggeredList Component
 * Animates list items with stagger effect
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { staggerContainerVariants, fadeUpVariants, shouldAnimate } from "@/lib/animations/config";
import { useScrollReveal } from "@/lib/animations/hooks";

interface StaggeredListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

export default function StaggeredList({
  children,
  staggerDelay = 0.08,
  className = "",
  itemClassName = "",
}: StaggeredListProps) {
  const { ref, isInView } = useScrollReveal({ threshold: 0.1, triggerOnce: true });

  // If animations disabled, render without motion
  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={fadeUpVariants}
              className={itemClassName}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
