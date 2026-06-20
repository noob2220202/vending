"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatKRW } from "@/lib/utils";

interface AdminCharge {
  id: string;
  status: string;
  krwAmount: number;
  quotedUsdt: number;
  actualUsdt: number | null;
  matchType: string | null;
  matchedTxId: string | null;
  createdAt: string;
  user: { username: string; walletAddress: string };
}

const FILTERS = ["PENDING", "MISMATCHED", "CONFIRMED", "EXPIRED", "REJECTED", "ALL"] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  CONFIRMED: "확인됨",
  MISMATCHED: "금액불일치",
  EXPIRED: "만료",
  REJECTED: "거절",
};

export default function AdminChargesPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("PENDING");
  const [charges, setCharges] = React.useState<AdminCharge[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/charges?status=${filter}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setCharges(data.chargeRequests ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/charges/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await load();
      } else {
        const data = await res.json();
        alert(data.error ?? "처리에 실패했습니다");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
              filter === f
                ? "bg-accent text-white"
                : "bg-bg-card text-content-secondary"
            )}
          >
            {f === "ALL" ? "전체" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-content-secondary">
          불러오는 중...
        </p>
      ) : charges.length === 0 ? (
        <p className="py-8 text-center text-sm text-content-secondary">
          해당 충전요청이 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {charges.map((c) => (
            <Card key={c.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{c.user.username}</span>
                  <Badge
                    tone={
                      c.status === "CONFIRMED"
                        ? "success"
                        : c.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-content-secondary">
                  <span>요청금액</span>
                  <span className="tnum text-right text-content-primary">
                    {formatKRW(c.krwAmount)}
                  </span>
                  <span>견적 USDT</span>
                  <span className="tnum text-right">{c.quotedUsdt}</span>
                  {c.actualUsdt !== null && (
                    <>
                      <span>실제 수신 USDT</span>
                      <span className="tnum text-right">{c.actualUsdt}</span>
                    </>
                  )}
                  <span>등록된 발신주소</span>
                  <span className="break-all text-right font-mono">
                    {c.user.walletAddress}
                  </span>
                  {c.matchedTxId && (
                    <>
                      <span>TXID</span>
                      <span className="break-all text-right font-mono">
                        {c.matchedTxId}
                      </span>
                    </>
                  )}
                  <span>요청일시</span>
                  <span className="text-right">
                    {new Date(c.createdAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                {(c.status === "PENDING" ||
                  c.status === "MISMATCHED" ||
                  c.status === "EXPIRED") && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      loading={busyId === c.id}
                      onClick={() => act(c.id, "approve")}
                    >
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      loading={busyId === c.id}
                      onClick={() => act(c.id, "reject")}
                    >
                      거절
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
