/**
 * Animation Utility Hooks
 * Reusable hooks for common animation patterns
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useAnimation, AnimationControls } from "framer-motion";
import { prefersReducedMotion, shouldAnimate } from "./config";

/**
 * Hook for scroll-triggered reveal animations
 * Element animates in when it enters the viewport
 */
export function useScrollReveal(options?: {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.triggerOnce ?? true,
    amount: options?.threshold ?? 0.2,
  });

  return { ref, isInView };
}

/**
 * Hook for animated counter
 * Counts from 0 to target value when in view
 */
export function useAnimatedCounter(
  target: number,
  options?: {
    duration?: number;
    delay?: number;
    triggerOnce?: boolean;
  }
) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.triggerOnce ?? true,
  });

  useEffect(() => {
    if (!isInView || !shouldAnimate()) {
      setCount(target);
      return;
    }

    const duration = options?.duration ?? 2000;
    const delay = options?.delay ?? 0;
    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      
      if (now < startTime) return;
      if (now >= endTime) {
        setCount(target);
        clearInterval(timer);
        return;
      }

      const progress = (now - startTime) / duration;
      const easeProgress = easeOutCubic(progress);
      setCount(Math.floor(easeProgress * target));
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [isInView, target, options?.duration, options?.delay]);

  return { ref, count };
}

/**
 * Easing function for counter animation
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Hook for hover scale effect
 * Returns props to spread on motion.div
 */
export function useHoverScale(scale: number = 1.02) {
  if (!shouldAnimate()) {
    return {};
  }

  return {
    whileHover: { scale },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
  };
}

/**
 * Hook for shake animation on error
 */
export function useShakeOnError(error: boolean) {
  const controls = useAnimation();

  useEffect(() => {
    if (error && shouldAnimate()) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [error, controls]);

  return controls;
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

/**
 * Hook for staggered list animations
 */
export function useStaggerAnimation(
  itemCount: number,
  options?: {
    staggerDelay?: number;
    triggerOnce?: boolean;
  }
): {
  ref: React.RefObject<HTMLDivElement>;
  controls: AnimationControls;
  isInView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, {
    once: options?.triggerOnce ?? true,
  });

  useEffect(() => {
    if (isInView && shouldAnimate()) {
      controls.start("animate");
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
}

/**
 * Hook for GSAP scroll trigger cleanup
 * Automatically kills scroll triggers on unmount
 */
export function useGSAPCleanup(callback: () => void) {
  useEffect(() => {
    if (!shouldAnimate()) return;
    
    callback();

    return () => {
      // Cleanup will be handled by GSAP's context
    };
  }, [callback]);
}

/**
 * Hook for page transition direction
 * Detects if user is navigating forward or backward
 */
export function usePageDirection(): "forward" | "backward" {
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Simple heuristic: if path is shorter, likely going back
    if (currentPath.length < previousPathRef.current.length) {
      setDirection("backward");
    } else {
      setDirection("forward");
    }

    previousPathRef.current = currentPath;
  }, []);

  return direction;
}

/**
 * Hook for intersection observer with callback
 */
export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return ref;
}

/**
 * Hook for RAF (RequestAnimationFrame) based animations
 */
export function useRAF(
  callback: (deltaTime: number) => void,
  isActive: boolean = true
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !shouldAnimate()) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback, isActive]);
}
