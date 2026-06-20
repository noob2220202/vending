import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return fail("로그인이 필요합니다", 401);

  const spin = await prisma.rouletteSpin.findUnique({
    where: { userId },
    include: { coupon: true },
  });

  if (!spin) return ok({ spun: false });

  return ok({
    spun: true,
    resultSegment: spin.resultSegment,
    coupon: spin.coupon
      ? {
          id: spin.coupon.id,
          type: spin.coupon.type,
          value: spin.coupon.value,
          maxBonus: spin.coupon.maxBonus,
          minSpend: spin.coupon.minSpend,
          status: spin.coupon.status,
          expiresAt: spin.coupon.expiresAt.toISOString(),
        }
      : null,
  });
}
