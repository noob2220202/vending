"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKRW, formatNumber } from "@/lib/utils";

interface AdminChannel {
  id: string;
  title: string;
  category: string;
  establishedYear: number;
  subscriberCount: number;
  price: number;
  status: string;
  isActive: boolean;
  createdAt: string;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  PROCESSING: "warning",
  DELIVERED: "neutral",
  SOLD: "neutral",
};

const emptyForm = {
  title: "",
  category: "",
  establishedYear: new Date().getFullYear() - 1,
  subscriberCount: 0,
  price: 0,
  description: "",
};

export default function AdminChannelsPage() {
  const [channels, setChannels] = React.useState<AdminChannel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/channels", { cache: "no-store" });
      const data = await res.json();
      setChannels(data.channels ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createChannel() {
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "등록에 실패했습니다");
        return;
      }
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(c: AdminChannel) {
    setBusyId(c.id);
    try {
      await fetch(`/api/admin/channels/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function markSold(c: AdminChannel) {
    setBusyId(c.id);
    try {
      await fetch(`/api/admin/channels/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? "취소" : "+ 새 채널 등록"}
      </Button>

      {showForm && (
        <Card glass>
          <CardBody className="space-y-2">
            <Input
              label="채널명"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="카테고리"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="개설연도"
                type="number"
                value={form.establishedYear}
                onChange={(e) =>
                  setForm({ ...form, establishedYear: Number(e.target.value) })
                }
              />
              <Input
                label="구독자수"
                type="number"
                value={form.subscriberCount}
                onChange={(e) =>
                  setForm({ ...form, subscriberCount: Number(e.target.value) })
                }
              />
            </div>
            <Input
              label="가격 (원)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="설명 (선택)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button
              variant="gradient"
              className="w-full"
              loading={creating}
              onClick={createChannel}
            >
              등록하기
            </Button>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-content-secondary">
          불러오는 중...
        </p>
      ) : (
        <div className="space-y-2">
          {channels.map((c) => (
            <Card key={c.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>{c.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-content-secondary">
                  <span>구독자</span>
                  <span className="tnum text-right">
                    {formatNumber(c.subscriberCount)}명
                  </span>
                  <span>개설연도</span>
                  <span className="text-right">{c.establishedYear}년</span>
                  <span>가격</span>
                  <span className="tnum text-right text-content-primary">
                    {formatKRW(c.price)}
                  </span>
                  <span>노출상태</span>
                  <span className="text-right">{c.isActive ? "노출중" : "숨김"}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    loading={busyId === c.id}
                    onClick={() => toggleActive(c)}
                  >
                    {c.isActive ? "노출 중지" : "노출 시작"}
                  </Button>
                  {c.status !== "SOLD" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      loading={busyId === c.id}
                      onClick={() => markSold(c)}
                    >
                      판매완료 처리
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
