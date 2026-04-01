/**
 * AnimatedCounter Component
 * Counts from 0 to target when in viewport
 */

"use client";

import { useAnimatedCounter } from "@/lib/animations/hooks";
import { formatNumber } from "@/lib/animations/utils";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  delay?: number;
  format?: boolean;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({
  target,
  duration = 2000,
  delay = 0,
  format = true,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const { ref, count } = useAnimatedCounter(target, { duration, delay });

  const displayValue = format ? formatNumber(count) : count.toString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
