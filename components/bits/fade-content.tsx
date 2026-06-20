"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface FadeContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * Fades children in once they enter the viewport. Plain opacity-only —
 * use AnimatedContent when a directional entrance is also wanted.
 */
export function FadeContent({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: FadeContentProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
