import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { ok } from "@/lib/http";
import type { ActiveCoupon } from "@/lib/types";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return ok({ coupon: null });

  const coupon = await prisma.coupon.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  const payload: ActiveCoupon | null = coupon
    ? {
        id: coupon.id,
        type: coupon.type as ActiveCoupon["type"],
        value: coupon.value,
        maxBonus: coupon.maxBonus,
        minSpend: coupon.minSpend,
        expiresAt: coupon.expiresAt.toISOString(),
      }
    : null;

  return ok({ coupon: payload });
}
