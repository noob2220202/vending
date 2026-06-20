"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { cn, formatKRW, orderTypeLabel, orderTypeTone } from "@/lib/utils";

interface AdminOrder {
  id: string;
  type: string;
  status: string;
  amount: number;
  quantity: number | null;
  createdAt: string;
  user: { username: string };
  smmProduct: { name: string } | null;
  channelListing: { title: string } | null;
  generalProduct: { name: string } | null;
}

const FILTERS = ["PROCESSING", "PENDING", "COMPLETED", "ALL"] as const;
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  PROCESSING: "처리중",
  PENDING: "대기",
  COMPLETED: "완료",
  ALL: "전체",
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("PROCESSING");
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "complete" | "cancel") {
    if (action === "cancel" && !confirm("주문을 취소하고 환불할까요?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
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
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-content-secondary">
          불러오는 중...
        </p>
      ) : orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-content-secondary">
          해당 주문이 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={orderTypeTone(o.type)}>{orderTypeLabel(o.type)}</Badge>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <span className="tnum text-sm font-bold">{formatKRW(o.amount)}</span>
                </div>
                <p className="text-sm">
                  {o.smmProduct?.name ??
                    o.channelListing?.title ??
                    o.generalProduct?.name ??
                    "주문"}
                  {o.quantity ? ` x${o.quantity}` : ""}
                </p>
                <p className="text-xs text-content-secondary">
                  {o.user.username} · {new Date(o.createdAt).toLocaleString("ko-KR")}
                </p>
                {(o.status === "PROCESSING" || o.status === "PENDING") && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      loading={busyId === o.id}
                      onClick={() => act(o.id, "complete")}
                    >
                      완료 처리
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      loading={busyId === o.id}
                      onClick={() => act(o.id, "cancel")}
                    >
                      취소/환불
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
