"use client";

import * as React from "react";
import { msRemaining, formatMMSS } from "@/lib/utils";

/** Returns live ms remaining until `target`, ticking every second. */
export function useCountdown(target: string | Date | number | null) {
  const [ms, setMs] = React.useState(() =>
    target ? msRemaining(target) : 0
  );

  React.useEffect(() => {
    if (!target) return;
    setMs(msRemaining(target));
    const id = setInterval(() => {
      const left = msRemaining(target);
      setMs(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return ms;
}

export function Countdown({
  target,
  className,
  onExpire,
}: {
  target: string | Date | number;
  className?: string;
  onExpire?: () => void;
}) {
  const ms = useCountdown(target);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (ms <= 0 && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [ms, onExpire]);

  return <span className={className}>{formatMMSS(ms)}</span>;
}
