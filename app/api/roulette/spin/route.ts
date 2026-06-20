import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

// v1 (spec §2.1): every spin lands on the 50,000-won segment. The wheel
// shows four visual segments for suspense, but the result is always decided
// here, server-side — the client only plays the landing animation.
const RESULT_SEGMENT = "50000";
const COUPON_WINDOW_MS = 60 * 60 * 1000;

export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  const existing = await prisma.rouletteSpin.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return fail("이미 룰렛에 참여하셨습니다", 409);
  }

  try {
    const spin = await prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.create({
        data: {
          userId: user.id,
          type: "PERCENT_MATCH",
          value: 100,
          maxBonus: 50000,
          expiresAt: new Date(user.signupAt.getTime() + COUPON_WINDOW_MS),
          source: "ROULETTE",
        },
      });
      return tx.rouletteSpin.create({
        data: {
          userId: user.id,
          resultSegment: RESULT_SEGMENT,
          couponId: coupon.id,
        },
        include: { coupon: true },
      });
    });

    return ok({
      resultSegment: spin.resultSegment,
      coupon: spin.coupon && {
        id: spin.coupon.id,
        type: spin.coupon.type,
        value: spin.coupon.value,
        maxBonus: spin.coupon.maxBonus,
        minSpend: spin.coupon.minSpend,
        status: spin.coupon.status,
        expiresAt: spin.coupon.expiresAt.toISOString(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail("이미 룰렛에 참여하셨습니다", 409);
    }
    throw e;
  }
}
