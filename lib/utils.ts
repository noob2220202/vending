import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer KRW amount, e.g. 50000 -> "50,000원". */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** Format a plain number with thousands separators. */
export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

/** Milliseconds left until `target`, clamped at 0. */
export function msRemaining(target: Date | string | number): number {
  const t = new Date(target).getTime();
  return Math.max(0, t - Date.now());
}

/** Format milliseconds as mm:ss (tabular-friendly). */
export function formatMMSS(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compute SMM order price: quantity * pricePerThousand / 1000, rounded. */
export function smmPrice(quantity: number, pricePerThousand: number): number {
  return Math.round((quantity * pricePerThousand) / 1000);
}

const ORDER_TYPE_LABEL = {
  SMM: "SMM",
  CHANNEL: "연식채널",
  GENERAL: "일반상품",
} as const;

const ORDER_TYPE_TONE = {
  SMM: "accent",
  CHANNEL: "gradient",
  GENERAL: "neutral",
} as const;

export function orderTypeLabel(type: keyof typeof ORDER_TYPE_LABEL): string {
  return ORDER_TYPE_LABEL[type];
}

export function orderTypeTone(
  type: keyof typeof ORDER_TYPE_TONE
): "accent" | "gradient" | "neutral" {
  return ORDER_TYPE_TONE[type];
}
