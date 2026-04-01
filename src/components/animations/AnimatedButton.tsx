/**
 * AnimatedButton Component
 * Button with loading state and hover animations
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { shouldAnimate } from "@/lib/animations/config";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  className?: string;
}

export default function AnimatedButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  type = "button",
  variant = "primary",
  className = "",
}: AnimatedButtonProps) {
  const baseClass = variant === "primary" ? "btn-primary" : 
                   variant === "secondary" ? "btn-secondary" :
                   variant === "outline" ? "btn-outline" :
                   variant === "ghost" ? "btn-ghost" :
                   "btn-danger";

  const ButtonComponent = shouldAnimate() ? motion.button : "button";
  const buttonProps = shouldAnimate() ? {
    whileHover: disabled || loading ? {} : { scale: 1.02, boxShadow: "0 4px 12px rgba(255, 122, 61, 0.2)" },
    whileTap: disabled || loading ? {} : { scale: 0.98 },
    transition: { duration: 0.2 },
  } : {};

  return (
    <ButtonComponent
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${className} relative`}
      {...buttonProps}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
        >
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </ButtonComponent>
  );
}
