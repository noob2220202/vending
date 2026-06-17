"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers";
import { cn, formatKRW } from "@/lib/utils";

const PRESETS = [10000, 30000, 50000, 100000];

export default function ChargePage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const [amount, setAmount] = React.useState(30000);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function charge() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/charge/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ krwAmount: amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "충전에 실패했습니다");
        return;
      }
      await refresh();
      router.push("/mypage");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">충전</h1>

      <Card glass>
        <CardBody className="flex items-start gap-2 text-xs text-content-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            현재는 Phase 1 모의 충전입니다. Phase 3에서 USDT-TRC20 입금
            자동매칭 + TXID 제출 방식으로 대체됩니다.
          </p>
        </CardBody>
      </Card>

      {user && (
        <p className="text-sm text-content-secondary">
          현재 잔액{" "}
          <span className="tnum font-semibold text-content-primary">
            {formatKRW(user.walletBalance)}
          </span>
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={cn(
              "tnum rounded-xl py-2.5 text-sm font-medium transition",
              amount === v
                ? "bg-accent text-white"
                : "bg-bg-card text-content-secondary"
            )}
          >
            {v.toLocaleString("ko-KR")}
          </button>
        ))}
      </div>

      <Input
        label="충전 금액 (원)"
        type="number"
        inputMode="numeric"
        value={amount}
        min={1000}
        max={1000000}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="tnum"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        variant="gradient"
        className="w-full"
        loading={loading}
        onClick={charge}
      >
        {formatKRW(amount)} 충전하기
      </Button>
    </div>
  );
}
