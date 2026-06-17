import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, Coins, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatKRW, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [orders, coupons] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { smmProduct: true, channelListing: true },
    }),
    prisma.coupon.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">마이페이지</h1>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardBody>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-content-secondary">
              <Wallet className="h-3.5 w-3.5 text-accent" /> 지갑 잔액
            </div>
            <p className="tnum text-xl font-bold">
              {formatKRW(user.walletBalance)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-content-secondary">
              <Coins className="h-3.5 w-3.5 text-warning" /> 포인트
            </div>
            <p className="tnum text-xl font-bold">
              {formatNumber(user.pointBalance)}P
            </p>
          </CardBody>
        </Card>
      </div>

      <Link
        href="/mypage/charge"
        className="flex items-center justify-center gap-1.5 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
      >
        <Plus className="h-4 w-4" /> 충전하기
      </Link>

      {/* Coupons */}
      {coupons.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold">쿠폰함</h2>
          <div className="space-y-2">
            {coupons.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {c.type === "PERCENT_MATCH"
                        ? `구매액 ${c.value}% 매칭 적립`
                        : `${formatKRW(c.value)} 적립`}
                    </p>
                    <p className="text-xs text-content-secondary">
                      최대 {formatKRW(c.maxBonus)} · {c.source}
                    </p>
                  </div>
                  <Badge
                    tone={
                      c.status === "ACTIVE"
                        ? "success"
                        : c.status === "USED"
                          ? "neutral"
                          : "danger"
                    }
                  >
                    {c.status === "ACTIVE"
                      ? "사용가능"
                      : c.status === "USED"
                        ? "사용함"
                        : "만료"}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Orders */}
      <section>
        <h2 className="mb-2 text-base font-bold">주문내역</h2>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-content-secondary">
            주문 내역이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link key={o.id} href={`/mypage/orders/${o.id}`}>
                <Card className="transition hover:border-accent/50">
                  <CardBody className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge tone={o.type === "SMM" ? "accent" : "gradient"}>
                          {o.type === "SMM" ? "SMM" : "연식채널"}
                        </Badge>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-sm font-medium">
                        {o.smmProduct?.name ??
                          o.channelListing?.title ??
                          "주문"}
                      </p>
                    </div>
                    <p className="tnum text-sm font-bold">
                      {formatKRW(o.amount)}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
