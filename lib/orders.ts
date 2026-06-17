import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Apply an active roulette/match coupon to a completed checkout, inside the
 * given transaction. Returns the bonus points granted (0 if no coupon).
 *
 * PERCENT_MATCH: bonus = min(spend * value%, maxBonus).
 * FIXED:         bonus = min(maxBonus, value) — flat grant.
 * Bonus points are non-withdrawable (enforced by never exposing a payout path).
 */
export async function applyCouponMatch(
  tx: Tx,
  userId: string,
  spend: number
): Promise<number> {
  const coupon = await tx.coupon.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!coupon || spend < coupon.minSpend) return 0;

  const bonus =
    coupon.type === "PERCENT_MATCH"
      ? Math.min(Math.floor((spend * coupon.value) / 100), coupon.maxBonus)
      : Math.min(coupon.value, coupon.maxBonus);

  if (bonus <= 0) return 0;

  await tx.coupon.update({
    where: { id: coupon.id },
    data: { status: "USED" },
  });

  const user = await tx.user.update({
    where: { id: userId },
    data: { pointBalance: { increment: bonus } },
  });

  await tx.walletTransaction.create({
    data: {
      userId,
      type: "BONUS",
      amount: bonus,
      balanceAfter: user.pointBalance,
      memo: `매칭 적립 (쿠폰 ${coupon.source})`,
    },
  });

  return bonus;
}
