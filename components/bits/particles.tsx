"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ParticlesProps {
  className?: string;
  count?: number;
  color?: string;
}

/**
 * Lightweight floating-dust canvas background. Pauses when scrolled out
 * of view and skips entirely under prefers-reduced-motion.
 */
export function Particles({ className, count = 36, color = "255,255,255" }: ParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    const dpr = window.devicePixelRatio || 1;

    const dots = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.06 + 0.02,
      o: Math.random() * 0.5 + 0.2,
    }));

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const dot of dots) {
        dot.y -= dot.vy / height;
        if (dot.y < 0) dot.y = 1;
        ctx!.beginPath();
        ctx!.arc(dot.x * width, dot.y * height, dot.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},${dot.o})`;
        ctx!.fill();
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
