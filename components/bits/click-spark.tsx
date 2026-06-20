"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Spark {
  id: number;
  x: number;
  y: number;
}

/**
 * Wraps children and emits a short-lived ring of spark lines from the
 * click point — use around buy/spin buttons for tactile feedback.
 */
export function ClickSpark({
  className,
  sparkColor = "var(--accent)",
  children,
}: {
  className?: string;
  sparkColor?: string;
  children: React.ReactNode;
}) {
  const [sparks, setSparks] = React.useState<Spark[]>([]);
  const idRef = React.useRef(0);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setSparks((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== id));
    }, 500);
  }

  return (
    <div className={cn("relative", className)} onClick={handleClick}>
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          aria-hidden
          className="pointer-events-none absolute z-20"
          style={{ left: spark.x, top: spark.y }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 360;
            return (
              <span
                key={i}
                className="absolute h-px w-3 origin-left animate-spark-out"
                style={
                  {
                    backgroundColor: sparkColor,
                    "--spark-angle": `${angle}deg`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
