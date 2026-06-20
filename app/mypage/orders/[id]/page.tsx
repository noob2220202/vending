import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatKRW, formatNumber, orderTypeLabel, orderTypeTone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { smmProduct: true, channelListing: true, generalProduct: true },
  });
  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="space-y-4 py-2">
      <Link
        href="/mypage"
        className="inline-flex items-center gap-1 text-sm text-content-secondary"
      >
        <CaretLeft className="h-4 w-4" /> 마이페이지
      </Link>

      <div className="flex items-center gap-2">
        <Badge tone={orderTypeTone(order.type)}>{orderTypeLabel(order.type)}</Badge>
        <OrderStatusBadge status={order.status} />
      </div>

      <h1 className="text-xl font-bold">
        {order.smmProduct?.name ??
          order.channelListing?.title ??
          order.generalProduct?.name ??
          "주문 상세"}
      </h1>

      <Card>
        <CardBody className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-content-secondary">주문번호</span>
          <span className="break-all text-right text-xs">{order.id}</span>

          {order.type === "SMM" && (
            <>
              <span className="text-content-secondary">수량</span>
              <span className="tnum text-right">
                {formatNumber(order.quantity ?? 0)}개
              </span>
              <span className="text-content-secondary">대상 링크</span>
              <span className="break-all text-right text-xs">
                {order.targetUrl}
              </span>
            </>
          )}

          {order.type === "CHANNEL" && order.channelListing && (
            <>
              <span className="text-content-secondary">개설연도</span>
              <span className="text-right">
                {order.channelListing.establishedYear}년
              </span>
              <span className="text-content-secondary">전달 마감</span>
              <span className="text-right text-xs">
                {order.channelListing.deliveryDeadline
                  ? new Date(
                      order.channelListing.deliveryDeadline
                    ).toLocaleString("ko-KR")
                  : "결제 후 24시간 내"}
              </span>
            </>
          )}

          {order.type === "GENERAL" && (
            <>
              <span className="text-content-secondary">수량</span>
              <span className="tnum text-right">
                {formatNumber(order.quantity ?? 0)}개
              </span>
            </>
          )}

          <span className="text-content-secondary">결제금액</span>
          <span className="tnum text-right font-semibold">
            {formatKRW(order.amount)}
          </span>
          {order.bonusEarned > 0 && (
            <>
              <span className="text-content-secondary">매칭 적립</span>
              <span className="tnum text-right text-warning">
                +{formatNumber(order.bonusEarned)}P
              </span>
            </>
          )}
          <span className="text-content-secondary">주문일시</span>
          <span className="text-right text-xs">
            {new Date(order.createdAt).toLocaleString("ko-KR")}
          </span>
        </CardBody>
      </Card>

      {order.type === "CHANNEL" && order.status === "PROCESSING" && (
        <Card glass>
          <CardBody className="text-xs text-content-secondary">
            운영자가 24시간 내(영업일 기준 지연 가능) 채널 소유권을 이전합니다.
            전달 완료 시 알림을 보내드립니다.
          </CardBody>
        </Card>
      )}

      {order.type === "GENERAL" && order.status === "PROCESSING" && (
        <Card glass>
          <CardBody className="text-xs text-content-secondary">
            운영자가 결제 확인 후 상품을 직접 전달합니다. 전달 완료 시 알림을
            보내드립니다.
          </CardBody>
        </Card>
      )}
    </div>
  );
}
