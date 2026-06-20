"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
}

const offsets: Record<NonNullable<AnimatedContentProps["direction"]>, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
};

/**
 * Viewport-triggered fade + directional slide-in, for cards/sections that
 * should feel like they "arrive" rather than just appear.
 */
export function AnimatedContent({
  children,
  className,
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.5,
}: AnimatedContentProps) {
  const offset = offsets[direction];
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: offset.x ? offset.x * distance : 0,
        y: offset.y ? offset.y * distance : 0,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
