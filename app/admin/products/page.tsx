"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn, formatKRW, formatNumber } from "@/lib/utils";

type Mode = "SMM" | "GENERAL";

interface AdminSmmProduct {
  id: string;
  platform: string;
  category: string;
  name: string;
  pricePerThousand: number;
  minQty: number;
  maxQty: number;
  speedLabel: string;
  externalServiceId: string;
  isActive: boolean;
}

interface AdminGeneralProduct {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
}

const SMM_CATEGORIES = [
  { value: "MEMBERS", label: "멤버" },
  { value: "VIEWS", label: "조회수" },
  { value: "REACTIONS", label: "리액션" },
  { value: "BOOST", label: "부스트" },
];

const emptySmmForm = {
  platform: "TELEGRAM",
  category: "MEMBERS",
  name: "",
  pricePerThousand: 0,
  minQty: 100,
  maxQty: 10000,
  speedLabel: "",
  externalServiceId: "",
};

const emptyGeneralForm = {
  name: "",
  category: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrl: "",
};

export default function AdminProductsPage() {
  const [mode, setMode] = React.useState<Mode>("SMM");
  const [smmProducts, setSmmProducts] = React.useState<AdminSmmProduct[]>([]);
  const [generalProducts, setGeneralProducts] = React.useState<
    AdminGeneralProduct[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [smmForm, setSmmForm] = React.useState(emptySmmForm);
  const [generalForm, setGeneralForm] = React.useState(emptyGeneralForm);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [smmRes, generalRes] = await Promise.all([
        fetch("/api/admin/smm-products", { cache: "no-store" }),
        fetch("/api/admin/general-products", { cache: "no-store" }),
      ]);
      const smmData = await smmRes.json();
      const generalData = await generalRes.json();
      setSmmProducts(smmData.products ?? []);
      setGeneralProducts(generalData.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createProduct() {
    setError("");
    setCreating(true);
    try {
      const endpoint =
        mode === "SMM" ? "/api/admin/smm-products" : "/api/admin/general-products";
      const body = mode === "SMM" ? smmForm : generalForm;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "등록에 실패했습니다");
        return;
      }
      setSmmForm(emptySmmForm);
      setGeneralForm(emptyGeneralForm);
      setShowForm(false);
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(type: Mode, id: string, isActive: boolean) {
    setBusyId(id);
    try {
      const endpoint =
        type === "SMM"
          ? `/api/admin/smm-products/${id}`
          : `/api/admin/general-products/${id}`;
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["SMM", "GENERAL"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setShowForm(false);
              setError("");
            }}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-medium transition",
              mode === m
                ? "bg-accent text-white"
                : "bg-bg-card text-content-secondary hover:text-content-primary"
            )}
          >
            {m === "SMM" ? "SMM 상품" : "일반 상품"}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? "취소" : mode === "SMM" ? "+ 새 SMM 상품 등록" : "+ 새 일반 상품 등록"}
      </Button>

      {showForm && mode === "SMM" && (
        <Card glass>
          <CardBody className="space-y-2">
            <Input
              label="상품명"
              value={smmForm.name}
              onChange={(e) => setSmmForm({ ...smmForm, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="플랫폼"
                value={smmForm.platform}
                onChange={(e) =>
                  setSmmForm({ ...smmForm, platform: e.target.value })
                }
              />
              <Select
                label="카테고리"
                value={smmForm.category}
                onChange={(e) =>
                  setSmmForm({ ...smmForm, category: e.target.value })
                }
              >
                {SMM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="1,000개당 가격 (원)"
              type="number"
              value={smmForm.pricePerThousand}
              onChange={(e) =>
                setSmmForm({ ...smmForm, pricePerThousand: Number(e.target.value) })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="최소 수량"
                type="number"
                value={smmForm.minQty}
                onChange={(e) =>
                  setSmmForm({ ...smmForm, minQty: Number(e.target.value) })
                }
              />
              <Input
                label="최대 수량"
                type="number"
                value={smmForm.maxQty}
                onChange={(e) =>
                  setSmmForm({ ...smmForm, maxQty: Number(e.target.value) })
                }
              />
            </div>
            <Input
              label="처리 속도 안내"
              placeholder="예: 1,000개/일"
              value={smmForm.speedLabel}
              onChange={(e) =>
                setSmmForm({ ...smmForm, speedLabel: e.target.value })
              }
            />
            <Input
              label="외부 패널 서비스 ID"
              hint="SMM 패널 API의 service id (주문 전달 시 사용)"
              value={smmForm.externalServiceId}
              onChange={(e) =>
                setSmmForm({ ...smmForm, externalServiceId: e.target.value })
              }
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button
              variant="gradient"
              className="w-full"
              loading={creating}
              onClick={createProduct}
            >
              등록하기
            </Button>
          </CardBody>
        </Card>
      )}

      {showForm && mode === "GENERAL" && (
        <Card glass>
          <CardBody className="space-y-2">
            <Input
              label="상품명"
              value={generalForm.name}
              onChange={(e) =>
                setGeneralForm({ ...generalForm, name: e.target.value })
              }
            />
            <Input
              label="카테고리"
              value={generalForm.category}
              onChange={(e) =>
                setGeneralForm({ ...generalForm, category: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="가격 (원)"
                type="number"
                value={generalForm.price}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, price: Number(e.target.value) })
                }
              />
              <Input
                label="재고"
                type="number"
                value={generalForm.stock}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, stock: Number(e.target.value) })
                }
              />
            </div>
            <Input
              label="이미지 URL (선택)"
              value={generalForm.imageUrl}
              onChange={(e) =>
                setGeneralForm({ ...generalForm, imageUrl: e.target.value })
              }
            />
            <Input
              label="설명 (선택)"
              value={generalForm.description}
              onChange={(e) =>
                setGeneralForm({ ...generalForm, description: e.target.value })
              }
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button
              variant="gradient"
              className="w-full"
              loading={creating}
              onClick={createProduct}
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
      ) : mode === "SMM" ? (
        <div className="space-y-2">
          {smmProducts.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <Badge tone={p.isActive ? "success" : "neutral"}>
                    {p.isActive ? "노출중" : "숨김"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-content-secondary">
                  <span>플랫폼 / 카테고리</span>
                  <span className="text-right">
                    {p.platform} · {SMM_CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category}
                  </span>
                  <span>1,000개당 가격</span>
                  <span className="tnum text-right text-content-primary">
                    {formatKRW(p.pricePerThousand)}
                  </span>
                  <span>수량범위</span>
                  <span className="tnum text-right">
                    {formatNumber(p.minQty)} ~ {formatNumber(p.maxQty)}
                  </span>
                  <span>외부 서비스 ID</span>
                  <span className="text-right">{p.externalServiceId}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={busyId === p.id}
                  onClick={() => toggleActive("SMM", p.id, p.isActive)}
                >
                  {p.isActive ? "노출 중지" : "노출 시작"}
                </Button>
              </CardBody>
            </Card>
          ))}
          {smmProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-content-secondary">
              등록된 SMM 상품이 없습니다.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {generalProducts.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <Badge tone={p.isActive ? "success" : "neutral"}>
                    {p.isActive ? "노출중" : "숨김"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-content-secondary">
                  <span>카테고리</span>
                  <span className="text-right">{p.category}</span>
                  <span>가격</span>
                  <span className="tnum text-right text-content-primary">
                    {formatKRW(p.price)}
                  </span>
                  <span>재고</span>
                  <span className="tnum text-right">{formatNumber(p.stock)}개</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={busyId === p.id}
                  onClick={() => toggleActive("GENERAL", p.id, p.isActive)}
                >
                  {p.isActive ? "노출 중지" : "노출 시작"}
                </Button>
              </CardBody>
            </Card>
          ))}
          {generalProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-content-secondary">
              등록된 일반 상품이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
