import * as React from "react";
import { cn } from "@/lib/utils";

export interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  speedSeconds?: number;
}

/**
 * Wraps children with a rotating comet-light border (conic-gradient masked
 * to a thin ring). Use around primary CTAs that need to stand out from
 * the flat .gradient-border treatment.
 */
export function StarBorder({
  as: Tag = "div",
  className,
  speedSeconds = 4,
  children,
  style,
  ...props
}: StarBorderProps) {
  return (
    <Tag
      className={cn("relative inline-flex rounded-2xl p-[1.5px] overflow-hidden", className)}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-[-50%] animate-spin"
        style={{
          animationDuration: `${speedSeconds}s`,
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--accent) 60deg, transparent 120deg)",
        }}
      />
      <span className="relative z-10 flex w-full items-center justify-center rounded-2xl bg-bg-card">
        {children}
      </span>
    </Tag>
  );
}
