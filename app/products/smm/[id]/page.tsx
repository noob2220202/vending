import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmmPurchasePanel } from "@/components/product/smm-purchase-panel";
import { formatKRW, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  MEMBERS: "멤버",
  VIEWS: "조회수",
  REACTIONS: "리액션",
  BOOST: "부스트",
};

export default async function SmmDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await prisma.smmProduct.findUnique({ where: { id: params.id } });
  if (!p || !p.isActive) notFound();

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center gap-2">
        <Badge tone="accent">{CATEGORY_LABEL[p.category] ?? p.category}</Badge>
        <Badge tone="neutral">{p.platform}</Badge>
        <Badge tone="success">{p.speedLabel}</Badge>
      </div>

      <h1 className="text-xl font-bold">{p.name}</h1>

      <Card>
        <CardBody className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-content-secondary">1,000개당 가격</span>
          <span className="tnum text-right font-semibold">
            {formatKRW(p.pricePerThousand)}
          </span>
          <span className="text-content-secondary">최소 수량</span>
          <span className="tnum text-right">{formatNumber(p.minQty)}개</span>
          <span className="text-content-secondary">최대 수량</span>
          <span className="tnum text-right">{formatNumber(p.maxQty)}개</span>
          <span className="text-content-secondary">처리 속도</span>
          <span className="text-right">{p.speedLabel}</span>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <SmmPurchasePanel
            product={{
              id: p.id,
              name: p.name,
              pricePerThousand: p.pricePerThousand,
              minQty: p.minQty,
              maxQty: p.maxQty,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
