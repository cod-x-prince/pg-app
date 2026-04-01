/**
 * ParallaxSection Component
 * Creates parallax scrolling effect using GSAP
 */

"use client";

import { ReactNode, useEffect, useRef } from "react";
import { shouldAnimate } from "@/lib/animations/config";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // 0.5 = half speed, 2 = double speed
  className?: string;
}

export default function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate() || !ref.current) return;

    // Lazy load GSAP ScrollTrigger
    import("gsap").then((gsap) => {
      import("gsap/ScrollTrigger").then((ScrollTriggerModule) => {
        const ScrollTrigger = ScrollTriggerModule.default;
        gsap.gsap.registerPlugin(ScrollTrigger);

        const element = ref.current;
        if (!element) return;

        const tl = gsap.gsap.to(element, {
          y: () => window.innerHeight * (1 - speed),
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          tl.kill();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      });
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
