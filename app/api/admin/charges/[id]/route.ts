import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { toChargeJson } from "@/lib/serialize";
import { logAudit } from "@/lib/audit";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("잘못된 요청입니다");

  const cr = await prisma.chargeRequest.findUnique({ where: { id: params.id } });
  if (!cr) return fail("충전 요청을 찾을 수 없습니다", 404);
  if (cr.status === "CONFIRMED" || cr.status === "REJECTED") {
    return fail("이미 처리된 충전 요청입니다", 409);
  }

  if (parsed.data.action === "reject") {
    const updated = await prisma.chargeRequest.update({
      where: { id: cr.id },
      data: { status: "REJECTED" },
    });
    await logAudit({
      actorId: admin.id,
      actorRole: admin.role,
      action: "CHARGE_REJECT",
      targetType: "ChargeRequest",
      targetId: cr.id,
      metadata: { krwAmount: cr.krwAmount },
    });
    return ok({ chargeRequest: toChargeJson(updated) });
  }

  // Admin manually verified the on-chain transfer (e.g. via block explorer)
  // and credits the wallet directly — used when auto/manual matching missed it.
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.chargeRequest.update({
      where: { id: cr.id },
      data: {
        status: "CONFIRMED",
        matchType: cr.matchType ?? "ADMIN_MANUAL",
        finalRate: cr.quotedRate,
        finalKrw: cr.krwAmount,
        confirmedAt: new Date(),
      },
    });
    const afterCredit = await tx.user.update({
      where: { id: cr.userId },
      data: { walletBalance: { increment: cr.krwAmount } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: cr.userId,
        type: "CHARGE",
        amount: cr.krwAmount,
        balanceAfter: afterCredit.walletBalance,
        memo: "USDT 충전 관리자 승인",
      },
    });
    return updated;
  });

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "CHARGE_APPROVE",
    targetType: "ChargeRequest",
    targetId: cr.id,
    metadata: { krwAmount: cr.krwAmount, matchType: result.matchType },
  });

  return ok({ chargeRequest: toChargeJson(result) });
}
