"use client";

import { useEffect, useRef } from "react";

// Tubes Cursor by Kevin Levron — CC BY-NC-SA 4.0
// https://codepen.io/soju22/pen/qEbdVjK

const TUBE_COLORS = ["#003049", "#f77f00", "#fcbf49"];
const LIGHT_COLORS = ["#fcbf49", "#f77f00", "#d62828", "#4a8ab0"];

type TubesCursorApp = {
  dispose: () => void;
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
};

export function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesCursorApp | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    async function init() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const TubesCursor = (
        await import("threejs-components/build/cursors/tubes1.min.js")
      ).default;

      if (cancelled || !canvas) return;

      appRef.current = TubesCursor(canvas, {
        tubes: {
          colors: TUBE_COLORS,
          lights: {
            intensity: 200,
            colors: LIGHT_COLORS,
          },
        },
      });
    }

    init();

    return () => {
      cancelled = true;
      appRef.current?.dispose();
      appRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none"
      aria-hidden
    />
  );
}
