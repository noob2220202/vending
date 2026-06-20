import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneralPurchasePanel } from "@/components/product/general-purchase-panel";
import { formatKRW } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GeneralDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await prisma.generalProduct.findUnique({ where: { id: params.id } });
  if (!p || !p.isActive) notFound();

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center gap-2">
        <Badge tone="neutral">{p.category}</Badge>
        {p.stock <= 0 && <Badge tone="danger">품절</Badge>}
      </div>

      <h1 className="text-xl font-bold">{p.name}</h1>

      {p.description && (
        <Card>
          <CardBody className="text-sm leading-relaxed text-content-secondary">
            {p.description}
          </CardBody>
        </Card>
      )}

      <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
        <span className="text-sm text-content-secondary">판매가</span>
        <span className="tnum text-xl font-bold text-accent">{formatKRW(p.price)}</span>
      </div>

      <GeneralPurchasePanel
        product={{ id: p.id, name: p.name, price: p.price, stock: p.stock }}
      />
    </div>
  );
}
