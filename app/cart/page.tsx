"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash, ShoppingCart } from "@phosphor-icons/react/ssr";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrimaryActionBar } from "@/components/layout/primary-action-bar";
import { useCart } from "@/store/cart";
import { formatKRW, formatNumber, orderTypeLabel, orderTypeTone } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingCart className="mb-3 h-10 w-10 text-content-secondary" />
        <p className="mb-4 text-content-secondary">장바구니가 비어 있습니다</p>
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
    <div className="space-y-3">
      <h1 className="text-xl font-bold">장바구니</h1>

      {items.map((it) => (
        <Card key={it.key}>
          <CardBody className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge tone={orderTypeTone(it.type)}>{orderTypeLabel(it.type)}</Badge>
              </div>
              <p className="text-sm font-semibold">{it.title}</p>
              {it.type === "SMM" && (
                <p className="tnum text-xs text-content-secondary">
                  수량 {formatNumber(it.quantity ?? 0)}개 ·{" "}
                  <span className="break-all">{it.targetUrl}</span>
                </p>
              )}
              {it.type === "GENERAL" && (
                <p className="tnum text-xs text-content-secondary">
                  수량 {formatNumber(it.quantity ?? 0)}개
                </p>
              )}
              <p className="tnum text-sm font-bold text-accent">
                {formatKRW(it.amount)}
              </p>
            </div>
            <button
              onClick={() => remove(it.key)}
              className="p-1.5 text-content-secondary hover:text-danger"
              aria-label="삭제"
            >
              <Trash className="h-4 w-4" />
            </button>
          </CardBody>
        </Card>
      ))}

      <PrimaryActionBar
        label={`${formatKRW(total)} 결제하기`}
        onClick={() => router.push("/checkout")}
      />
    </div>
  );
}
