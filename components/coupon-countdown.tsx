"use client";

import * as React from "react";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react/ssr";
import { useSession } from "@/components/providers";
import { useCountdown } from "@/components/ui/countdown";
import { formatMMSS } from "@/lib/utils";
import type { ActiveCoupon } from "@/lib/types";

/**
 * Header widget: shows the mm:ss countdown for the user's active roulette
 * coupon. Rendered only when an ACTIVE coupon exists and hasn't expired.
 */
export function CouponCountdown() {
  const { user } = useSession();
  const [coupon, setCoupon] = React.useState<ActiveCoupon | null>(null);

  React.useEffect(() => {
    if (!user) {
      setCoupon(null);
      return;
    }
    let alive = true;
    fetch("/api/coupons/active", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { coupon: null }))
      .then((d) => alive && setCoupon(d.coupon ?? null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  const ms = useCountdown(coupon?.expiresAt ?? null);
  if (!coupon || ms <= 0) return null;

  return (
    <Link
      href="/products/smm"
      className="flex items-center gap-1.5 rounded-xl bg-growth-gradient px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-accent/20"
      title="가입 1시간 한정 매칭 적립 쿠폰"
    >
      <Clock className="h-3.5 w-3.5" weight="bold" />
      <span className="tnum">{formatMMSS(ms)}</span>
    </Link>
  );
}
