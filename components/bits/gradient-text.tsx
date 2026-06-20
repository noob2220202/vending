import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  animate?: boolean;
}

/**
 * Inline text with the growth gradient as its fill, optionally animated
 * (background-position sweep) for emphasis on prices/CTAs.
 */
export function GradientText({
  className,
  animate = false,
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-growth-gradient bg-clip-text text-transparent",
        animate && "bg-[length:200%_auto] animate-gradient-sweep",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
