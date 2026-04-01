/**
 * Animation Utility Functions
 * Helper functions for animations
 */

import { Variants } from "framer-motion";

/**
 * Create stagger animation variant
 */
export function createStagger(
  staggerChildren: number = 0.08,
  delayChildren: number = 0
): Variants {
  return {
    animate: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

/**
 * Create fade variant with custom options
 */
export function createFadeVariant(
  direction: "up" | "down" | "left" | "right" | "none" = "up",
  distance: number = 24
): Variants {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      case "none":
        return {};
    }
  };

  return {
    initial: {
      opacity: 0,
      ...getInitialPosition(),
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  };
}

/**
 * Create scale variant
 */
export function createScaleVariant(
  from: number = 0.9,
  to: number = 1
): Variants {
  return {
    initial: {
      opacity: 0,
      scale: from,
    },
    animate: {
      opacity: 1,
      scale: to,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  };
}

/**
 * Create slide variant
 */
export function createSlideVariant(
  direction: "left" | "right" | "up" | "down",
  distance: number = 100
): Variants {
  const getPosition = () => {
    switch (direction) {
      case "left":
        return { x: -distance };
      case "right":
        return { x: distance };
      case "up":
        return { y: -distance };
      case "down":
        return { y: distance };
    }
  };

  return {
    initial: {
      opacity: 0,
      ...getPosition(),
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      ...getPosition(),
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 1.0, 1.0],
      },
    },
  };
}

/**
 * Delay utility for async operations
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

/**
 * Map value from one range to another
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Get random number between min and max
 */
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Get route type from pathname
 */
export function getRouteType(pathname: string): string {
  if (pathname === "/") return "homepage";
  if (pathname.startsWith("/properties")) return "listings";
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/owner")) return "dashboard";
  if (pathname.startsWith("/profile")) return "dashboard";
  if (pathname.startsWith("/admin")) return "admin";
  return "default";
}

/**
 * Add will-change CSS property for performance
 */
export function addWillChange(element: HTMLElement, properties: string[]) {
  element.style.willChange = properties.join(", ");
}

/**
 * Remove will-change CSS property
 */
export function removeWillChange(element: HTMLElement) {
  element.style.willChange = "auto";
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get scroll progress (0-1) of an element
 */
export function getScrollProgress(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const elementHeight = rect.height;
  const elementTop = rect.top;

  // Element is above viewport
  if (elementTop + elementHeight < 0) return 1;
  
  // Element is below viewport
  if (elementTop > windowHeight) return 0;

  // Calculate progress
  const visibleHeight = Math.min(
    elementHeight,
    windowHeight - elementTop,
    elementTop + elementHeight
  );
  
  return clamp(visibleHeight / elementHeight, 0, 1);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Create particle effect (for confetti, etc.)
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export function createParticles(
  count: number,
  origin: { x: number; y: number }
): Particle[] {
  const particles: Particle[] = [];
  const colors = ["#FF7A3D", "#FF9A5C", "#0F172A", "#E07A5F"];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: origin.x,
      y: origin.y,
      vx: random(-5, 5),
      vy: random(-8, -3),
      color: colors[Math.floor(random(0, colors.length))],
      size: random(3, 8),
    });
  }

  return particles;
}

/**
 * Update particle position (for RAF loop)
 */
export function updateParticle(particle: Particle, deltaTime: number): Particle {
  const dt = deltaTime / 16; // Normalize to 60fps
  
  return {
    ...particle,
    x: particle.x + particle.vx * dt,
    y: particle.y + particle.vy * dt,
    vy: particle.vy + 0.3 * dt, // Gravity
  };
}
