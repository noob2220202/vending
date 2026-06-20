"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AuroraProps {
  className?: string;
  colors?: [string, string, string];
  speedSeconds?: number;
}

/**
 * Soft animated gradient-blob background, absolutely positioned to fill
 * its nearest `relative` ancestor. Pure CSS (no canvas) so it stays cheap
 * on mobile; honors the global prefers-reduced-motion override.
 */
export function Aurora({
  className,
  colors = ["var(--gradient-start)", "var(--gradient-mid)", "var(--gradient-end)"],
  speedSeconds = 14,
}: AuroraProps) {
  const [a, b, c] = colors;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute -inset-[20%] opacity-50 blur-3xl animate-aurora"
        style={{
          backgroundImage: `radial-gradient(40% 40% at 20% 30%, ${a} 0%, transparent 70%),
            radial-gradient(40% 40% at 80% 20%, ${b} 0%, transparent 70%),
            radial-gradient(45% 45% at 50% 80%, ${c} 0%, transparent 70%)`,
          animationDuration: `${speedSeconds}s`,
        }}
      />
    </div>
  );
}
