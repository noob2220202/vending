"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Per-character slide-up + fade entrance, staggered. Use for short labels
 * (badges, section titles) where BlurText's softer reveal is too subtle.
 */
export function SplitText({ text, className, delay = 0.02 }: SplitTextProps) {
  return (
    <span className={cn("inline-flex", className)}>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * delay, ease: "easeOut" }}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
