"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { smmPrice, formatKRW, formatNumber } from "@/lib/utils";

export interface SmmPanelProduct {
  id: string;
  name: string;
  pricePerThousand: number;
  minQty: number;
  maxQty: number;
}

export function SmmPurchasePanel({ product }: { product: SmmPanelProduct }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = React.useState(product.minQty);
  const [url, setUrl] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const qtyError =
    qty < product.minQty
      ? `최소 ${formatNumber(product.minQty)}개부터 가능합니다`
      : qty > product.maxQty
        ? `최대 ${formatNumber(product.maxQty)}개까지 가능합니다`
        : "";
  const urlError = touched && !url.trim() ? "대상 링크를 입력해주세요" : "";
  const price = smmPrice(qty, product.pricePerThousand);
  const valid = !qtyError && url.trim().length > 0;

  function buildItem() {
    return {
      key: `smm-${product.id}-${Date.now()}`,
      type: "SMM" as const,
      refId: product.id,
      title: product.name,
      amount: price,
      quantity: qty,
      targetUrl: url.trim(),
    };
  }

  function addToCart() {
    setTouched(true);
    if (!valid) return;
    add(buildItem());
    router.push("/cart");
  }

  function buyNow() {
    setTouched(true);
    if (!valid) return;
    add(buildItem());
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <Input
        label="대상 링크 (채널/게시물 URL)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="https://t.me/..."
        error={urlError}
      />
      <Input
        label="수량"
        type="number"
        inputMode="numeric"
        value={qty}
        min={product.minQty}
        max={product.maxQty}
        onChange={(e) => setQty(Number(e.target.value))}
        hint={`최소 ${formatNumber(product.minQty)} ~ 최대 ${formatNumber(
          product.maxQty
        )}개`}
        error={qtyError}
        className="tnum"
      />

      <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
        <span className="text-sm text-content-secondary">예상 금액</span>
        <span className="tnum text-xl font-bold text-accent">
          {formatKRW(price)}
        </span>
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
