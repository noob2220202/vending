"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { formatKRW } from "@/lib/utils";

export interface GeneralPanelProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export function GeneralPurchasePanel({ product }: { product: GeneralPanelProduct }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = React.useState(1);

  const soldOut = product.stock <= 0;
  const qtyError =
    qty < 1
      ? "1개 이상 선택해주세요"
      : qty > product.stock
        ? `재고가 ${product.stock}개뿐입니다`
        : "";
  const amount = product.price * qty;
  const valid = !soldOut && !qtyError;

  function buildItem() {
    return {
      key: `general-${product.id}-${Date.now()}`,
      type: "GENERAL" as const,
      refId: product.id,
      title: product.name,
      amount,
      quantity: qty,
    };
  }

  function addToCart() {
    if (!valid) return;
    add(buildItem());
    router.push("/cart");
  }

  function buyNow() {
    if (!valid) return;
    add(buildItem());
    router.push("/checkout");
  }

  if (soldOut) {
    return (
      <Button className="w-full" disabled>
        품절된 상품입니다
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        label="수량"
        type="number"
        inputMode="numeric"
        value={qty}
        min={1}
        max={product.stock}
        onChange={(e) => setQty(Number(e.target.value))}
        hint={`재고 ${product.stock}개`}
        error={qtyError}
        className="tnum"
      />

      <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
        <span className="text-sm text-content-secondary">예상 금액</span>
        <span className="tnum text-xl font-bold text-accent">{formatKRW(amount)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={addToCart} disabled={!valid}>
          장바구니
        </Button>
        <Button variant="gradient" onClick={buyNow} disabled={!valid}>
          바로 구매
        </Button>
      </div>
    </div>
  );
}
