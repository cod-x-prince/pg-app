/**
 * FormFeedback Component
 * Animated feedback for forms (shake on error, success checkmark)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { shakeVariants, successCheckVariants, shouldAnimate } from "@/lib/animations/config";

interface FormFeedbackProps {
  error?: string;
  success?: string;
  className?: string;
}

export default function FormFeedback({ error, success, className = "" }: FormFeedbackProps) {
  if (!error && !success) return null;

  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          variants={shakeVariants}
          initial="initial"
          animate="shake"
          exit={{ opacity: 0, height: 0 }}
          className={`text-sm text-destructive font-medium flex items-center gap-2 mt-2 ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`text-sm text-success font-medium flex items-center gap-2 mt-2 ${className}`}
        >
          <motion.svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              variants={successCheckVariants}
              initial="initial"
              animate="animate"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
          {success}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
