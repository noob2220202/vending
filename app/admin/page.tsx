import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pendingCharges, mismatchedCharges, availableChannels, processingChannels, processingOrders] =
    await Promise.all([
      prisma.chargeRequest.count({ where: { status: "PENDING" } }),
      prisma.chargeRequest.count({ where: { status: "MISMATCHED" } }),
      prisma.channelListing.count({ where: { status: "AVAILABLE", isActive: true } }),
      prisma.channelListing.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
    ]);

  const stats = [
    { href: "/admin/charges", label: "대기중 충전요청", value: pendingCharges },
    { href: "/admin/charges", label: "금액불일치 충전요청", value: mismatchedCharges },
    { href: "/admin/channels", label: "판매중 채널", value: availableChannels },
    { href: "/admin/channels", label: "전달대기 채널", value: processingChannels },
    { href: "/admin/orders", label: "처리중 주문", value: processingOrders },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <Link key={s.label} href={s.href}>
          <Card className="transition hover:border-accent/50">
            <CardBody>
              <p className="text-xs text-content-secondary">{s.label}</p>
              <p className="tnum mt-1 text-2xl font-bold">{formatNumber(s.value)}</p>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
