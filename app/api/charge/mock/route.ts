import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

// Phase 1 convenience: top up wallet balance without real USDT settlement.
// Gated behind ENABLE_MOCK_CHARGE (or dev) and replaced by the TRON flow in Phase 3.
const mockEnabled =
  process.env.ENABLE_MOCK_CHARGE === "true" ||
  process.env.NODE_ENV !== "production";

const schema = z.object({
  krwAmount: z.number().int().min(1000).max(1_000_000),
});

export async function POST(req: Request) {
  if (!mockEnabled) return fail("사용할 수 없는 기능입니다", 403);

  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("충전 금액을 확인해주세요 (1,000~1,000,000원)");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { walletBalance: { increment: parsed.data.krwAmount } },
  });
  await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      type: "CHARGE",
      amount: parsed.data.krwAmount,
      balanceAfter: updated.walletBalance,
      memo: "모의 충전 (Phase 1)",
    },
  });

  return ok({ success: true, walletBalance: updated.walletBalance });
}
