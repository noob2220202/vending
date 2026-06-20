import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { findUsdtTransferByTxId } from "@/lib/tron";
import { toChargeJson } from "@/lib/serialize";

const schema = z.object({
  chargeRequestId: z.string().min(1),
  txId: z.string().trim().min(10).max(120),
});

// Allow small slippage between quote-time and payment-time USDT/KRW rate.
const TOLERANCE = 0.005;

export async function POST(req: Request) {
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
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }

  const cr = await prisma.chargeRequest.findUnique({
    where: { id: parsed.data.chargeRequestId },
  });
  if (!cr || cr.userId !== user.id) {
    return fail("충전 요청을 찾을 수 없습니다", 404);
  }
  if (cr.status === "CONFIRMED") {
    return ok({ success: true, chargeRequest: toChargeJson(cr) });
  }
  if (cr.status !== "PENDING") {
    return fail("이미 처리된 충전 요청입니다", 409);
  }
  if (cr.quoteExpiresAt < new Date()) {
    const expired = await prisma.chargeRequest.update({
      where: { id: cr.id },
      data: { status: "EXPIRED" },
    });
    return fail("충전 견적이 만료되었습니다. 다시 시도해주세요", 410, {
      chargeRequest: toChargeJson(expired),
    });
  }

  let transfer;
  try {
    transfer = await findUsdtTransferByTxId(parsed.data.txId);
  } catch {
    return fail("TRON 네트워크 조회에 실패했습니다. 잠시 후 다시 시도해주세요", 502);
  }
  if (!transfer) {
    return fail(
      "아직 해당 트랜잭션을 확인할 수 없습니다. 1~2분 후 다시 시도해주세요",
      404
    );
  }
  const quoted = Number(cr.quotedUsdt);
  const diff = Math.abs(transfer.amountUsdt - quoted) / quoted;
  if (diff > TOLERANCE) {
    return fail(
      `전송 금액이 일치하지 않습니다 (요청: ${quoted} USDT, 확인된 금액: ${transfer.amountUsdt} USDT)`,
      400
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.chargeRequest.update({
        where: { id: cr.id },
        data: {
          status: "CONFIRMED",
          matchType: "MANUAL_TXID",
          matchedTxId: transfer!.transactionId,
          actualUsdt: transfer!.amountUsdt,
          finalRate: cr.quotedRate,
          finalKrw: cr.krwAmount,
          confirmedAt: new Date(),
        },
      });
      const afterCredit = await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { increment: cr.krwAmount } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "CHARGE",
          amount: cr.krwAmount,
          balanceAfter: afterCredit.walletBalance,
          memo: "USDT 충전 확인 (TXID 직접제출)",
        },
      });
      return updated;
    });
    return ok({ success: true, chargeRequest: toChargeJson(result) });
  } catch (e) {
    // matchedTxId is unique — this TX may have just been claimed by the auto-poll
    // worker (or a duplicate submit). Treat as a race, not a hard failure.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const fresh = await prisma.chargeRequest.findUnique({
        where: { id: cr.id },
      });
      if (fresh?.status === "CONFIRMED") {
        return ok({ success: true, chargeRequest: toChargeJson(fresh) });
      }
      return fail("이미 다른 충전 요청에 사용된 거래입니다", 409);
    }
    throw e;
  }
}
