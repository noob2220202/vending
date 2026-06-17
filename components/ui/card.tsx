import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  glass,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        glass ? "glass" : "bg-bg-card border border-[var(--glass-border)]",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative z-10 p-4", className)} {...props} />;
}
