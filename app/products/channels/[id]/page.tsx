import { notFound } from "next/navigation";
import { Users, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChannelBuyPanel } from "@/components/product/channel-buy-panel";
import { formatKRW, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ChannelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const c = await prisma.channelListing.findUnique({
    where: { id: params.id },
  });
  if (!c || !c.isActive) notFound();
  const available = c.status === "AVAILABLE";

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center gap-2">
        <Badge tone="gradient">{c.establishedYear}년 개설</Badge>
        <Badge tone="neutral">{c.category}</Badge>
        {!available && <Badge tone="danger">판매중/완료</Badge>}
      </div>

      <h1 className="text-xl font-bold">{c.title}</h1>

      <div className="flex items-center gap-4 text-sm text-content-secondary">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span className="tnum">{formatNumber(c.subscriberCount)}</span> 구독자
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          24시간 내 수동전달
        </span>
      </div>

      {c.description && (
        <Card>
          <CardBody className="text-sm leading-relaxed text-content-secondary">
            {c.description}
          </CardBody>
        </Card>
      )}

      <Card glass>
        <CardBody className="flex items-start gap-2 text-xs text-content-secondary">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p>
            결제 완료 시점부터 24시간(영업일 기준 지연 가능) 내에 운영자가 직접
            채널 소유권을 이전합니다. 전달 완료 시 알림을 보내드립니다.
          </p>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
        <span className="text-sm text-content-secondary">판매가</span>
        <span className="tnum text-xl font-bold text-accent">
          {formatKRW(c.price)}
        </span>
      </div>

      <ChannelBuyPanel
        channel={{
          id: c.id,
          title: c.title,
          price: c.price,
          available,
        }}
      />
    </div>
  );
}
