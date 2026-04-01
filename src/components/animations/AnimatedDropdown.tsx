/**
 * AnimatedDropdown Component
 * Dropdown menu with smooth entrance/exit
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
import { dropdownVariants, shouldAnimate } from "@/lib/animations/config";

interface AnimatedDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}

export default function AnimatedDropdown({
  isOpen,
  onClose,
  children,
  className = "",
  align = "right",
}: AnimatedDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          variants={shouldAnimate() ? dropdownVariants : undefined}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} 
                     min-w-[200px] bg-popover rounded-xl shadow-elevated border border-border 
                     overflow-hidden z-50 ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
