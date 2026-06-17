"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Bottom-fixed single primary CTA. Isolated so a Telegram Mini App port can
 * swap it for the native BottomButton with a 1:1 replacement.
 */
export function PrimaryActionBar({
  label,
  sublabel,
  ...props
}: { label: string; sublabel?: string } & ButtonProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 safe-bottom border-t border-[var(--glass-border)] glass">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <Button size="lg" variant="gradient" className="w-full" {...props}>
          <span className="flex flex-col items-center leading-tight">
            <span>{label}</span>
            {sublabel && (
              <span className="text-xs font-normal opacity-90">{sublabel}</span>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
}
