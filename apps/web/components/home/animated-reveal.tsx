"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  threshold?: number;
  once?: boolean;
}

const directionOffset = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  none: "",
} as const;

export function AnimatedReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 700,
  threshold = 0.12,
  once = true,
}: AnimatedRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-all motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "motion-safe:translate-x-0 motion-safe:translate-y-0 motion-safe:opacity-100 motion-safe:blur-0 motion-safe:scale-100"
          : cn(
              "motion-safe:opacity-0 motion-safe:blur-[2px] motion-safe:scale-[0.98]",
              directionOffset[direction]
            ),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
