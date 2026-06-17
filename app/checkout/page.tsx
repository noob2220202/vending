"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, PartyPopper } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrimaryActionBar } from "@/components/layout/primary-action-bar";
import { useCart } from "@/store/cart";
import { useSession } from "@/components/providers";
import { formatKRW, formatNumber } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState<{ bonus: number } | null>(null);

  const insufficient = !!user && user.walletBalance < total;

  async function pay() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            type: i.type,
            refId: i.refId,
            quantity: i.quantity,
            targetUrl: i.targetUrl,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "결제에 실패했습니다");
        return;
      }
      clear();
      await refresh();
      setDone({ bonus: data.bonus ?? 0 });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <PartyPopper className="mb-3 h-12 w-12 text-success" />
        <h1 className="mb-1 text-xl font-bold">결제 완료!</h1>
        <p className="mb-2 text-sm text-content-secondary">
          주문이 정상적으로 접수되었습니다.
        </p>
        {done.bonus > 0 && (
          <Badge tone="gradient" className="mb-6">
            매칭 적립 +{formatNumber(done.bonus)}P
          </Badge>
        )}
        <div className="mt-6 flex gap-2">
          <Link
            href="/mypage"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            주문내역 보기
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-bg-card px-4 py-2.5 text-sm font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-content-secondary">결제하려면 로그인이 필요합니다</p>
        <Link
          href="/auth/login"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          로그인
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-content-secondary">결제할 상품이 없습니다</p>
        <Link
          href="/products/smm"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          상품 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">결제</h1>

      <Card>
        <CardBody className="space-y-2">
          {items.map((it) => (
            <div key={it.key} className="flex justify-between text-sm">
              <span className="text-content-secondary">{it.title}</span>
              <span className="tnum">{formatKRW(it.amount)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-[var(--glass-border)] pt-2 font-bold">
            <span>총 결제금액</span>
            <span className="tnum text-accent">{formatKRW(total)}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-content-secondary">
            <Wallet className="h-4 w-4 text-accent" /> 지갑 잔액
          </span>
          <span className="tnum font-semibold">
            {formatKRW(user.walletBalance)}
          </span>
        </CardBody>
      </Card>

      {insufficient && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <p className="text-sm text-danger">잔액이 부족합니다</p>
            <Link
              href="/mypage/charge"
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
            >
              충전하기
            </Link>
          </CardBody>
        </Card>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <PrimaryActionBar
        label={`${formatKRW(total)} 결제하기`}
        sublabel={insufficient ? "잔액 부족 — 충전이 필요합니다" : undefined}
        loading={loading}
        disabled={insufficient}
        onClick={pay}
      />
    </div>
  );
}
