/**
 * Animation Configuration
 * Centralized timing constants, easing curves, and animation variants
 */

import { Variants } from "framer-motion";

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const ANIMATION_TIMING = {
  // Fast, snappy interactions
  instant: 0.15,
  fast: 0.2,
  quick: 0.25,
  
  // Standard transitions - increased for smoother feel
  normal: 0.5,      // Was 0.3, now 0.5s for noticeable transitions
  moderate: 0.6,    // Was 0.4, now 0.6s
  
  // Slower, more deliberate
  slow: 0.7,        // Was 0.5
  slower: 0.8,      // Was 0.6
  slowest: 1.0,     // Was 0.8
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const EASING = {
  // Standard easing
  default: [0.4, 0.0, 0.2, 1],
  linear: [0.0, 0.0, 1.0, 1.0],
  
  // Ease in (slow start)
  easeIn: [0.4, 0.0, 1.0, 1.0],
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  
  // Ease out (slow end)
  easeOut: [0.0, 0.0, 0.2, 1.0],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeOutCubic: [0.215, 0.61, 0.355, 1.0],
  
  // Ease in-out (slow start and end)
  easeInOut: [0.4, 0.0, 0.2, 1.0],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInOutCubic: [0.645, 0.045, 0.355, 1.0],
  
  // Bounce and spring
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

// ============================================================================
// PAGE TRANSITION VARIANTS
// ============================================================================

// Homepage - Elaborate fade + scale with stagger
export const homepageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeOut,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeIn,
    },
  },
};

// Property Listings - Slide from right with fade
export const listingsVariants: Variants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeIn,
    },
  },
};

// Property Detail - Slide from right with scale
export const propertyDetailVariants: Variants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeIn,
    },
  },
};

// Auth Pages - Fade with subtle scale
export const authVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeIn,
    },
  },
};

// Dashboard - Slide from left with scale
export const dashboardVariants: Variants = {
  initial: {
    opacity: 0,
    x: -60,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeIn,
    },
  },
};

// Admin - Fade with subtle scale
export const adminVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.normal,
      ease: EASING.easeIn,
    },
  },
};

// Modal - Scale + fade from center
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.fast,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_TIMING.fast,
      ease: EASING.easeIn,
    },
  },
};

// ============================================================================
// SCROLL REVEAL VARIANTS
// ============================================================================

export const fadeUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeOut,
    },
  },
};

export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeOut,
    },
  },
};

export const scaleUpVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeOut,
    },
  },
};

// Staggered children container
export const staggerContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ============================================================================
// MICRO-INTERACTION VARIANTS
// ============================================================================

// Hover scale effect for cards
export const hoverScaleVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_TIMING.fast,
      ease: EASING.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.instant,
      ease: EASING.easeIn,
    },
  },
};

// Bounce effect for notifications
export const bounceVariants: Variants = {
  initial: {
    scale: 0,
  },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
};

// Shake animation for errors
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeInOut,
    },
  },
};

// Success checkmark
export const successCheckVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_TIMING.moderate,
      ease: EASING.easeOut,
    },
  },
};

// Dropdown menu
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.fast,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: ANIMATION_TIMING.instant,
      ease: EASING.easeIn,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get device performance level (basic check)
 */
export const getPerformanceLevel = (): "low" | "medium" | "high" => {
  if (typeof window === "undefined") return "high";
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  
  if (cores <= 2 || memory <= 2) return "low";
  if (cores <= 4 || memory <= 4) return "medium";
  return "high";
};

/**
 * Should animations be enabled?
 */
export const shouldAnimate = (): boolean => {
  if (prefersReducedMotion()) return false;
  if (getPerformanceLevel() === "low") return false;
  return true;
};
