"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  by?: "word" | "char";
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Reveals text word-by-word (or char-by-char) from blurred+transparent to
 * sharp+opaque. Intended for hero headlines.
 */
export function BlurText({
  text,
  className,
  delay = 0.04,
  by = "word",
  as = "span",
}: BlurTextProps) {
  const pieces = by === "word" ? text.split(" ") : Array.from(text);
  const Tag = motion[as];

  return (
    <Tag className={cn("inline-flex flex-wrap", className)}>
      {pieces.map((piece, i) => (
        <motion.span
          key={`${piece}-${i}`}
          initial={{ filter: "blur(10px)", opacity: 0, y: 8 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * delay, ease: "easeOut" }}
          className="inline-block"
        >
          {piece}
          {by === "word" && i < pieces.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
