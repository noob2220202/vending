import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { logAudit } from "@/lib/audit";

const schema = z.object({ action: z.enum(["complete", "cancel"]) });

export async function PATCH(
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

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return fail("주문을 찾을 수 없습니다", 404);
  if (["COMPLETED", "CANCELED", "REFUNDED"].includes(order.status)) {
    return fail("이미 처리된 주문입니다", 409);
  }

  if (parsed.data.action === "complete") {
    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      if (order.type === "CHANNEL" && order.channelListingId) {
        await tx.channelListing.update({
          where: { id: order.channelListingId },
          data: { status: "SOLD" },
        });
      }
      return o;
    });
    await logAudit({
      actorId: admin.id,
      actorRole: admin.role,
      action: "ORDER_COMPLETE",
      targetType: "Order",
      targetId: order.id,
    });
    return ok({ order: updated });
  }

  // Cancel: refund the buyer and release any reserved inventory.
  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });
    const refunded = await tx.user.update({
      where: { id: order.userId },
      data: { walletBalance: { increment: order.amount } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: order.userId,
        type: "REFUND",
        amount: order.amount,
        balanceAfter: refunded.walletBalance,
        memo: "관리자 주문 취소 환불",
      },
    });
    if (order.type === "CHANNEL" && order.channelListingId) {
      await tx.channelListing.update({
        where: { id: order.channelListingId },
        data: { status: "AVAILABLE", deliveryDeadline: null },
      });
    }
    if (order.type === "GENERAL" && order.generalProductId && order.quantity) {
      await tx.generalProduct.update({
        where: { id: order.generalProductId },
        data: { stock: { increment: order.quantity } },
      });
    }
    return o;
  });

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "ORDER_CANCEL",
    targetType: "Order",
    targetId: order.id,
    metadata: { refundAmount: order.amount },
  });

  return ok({ order: updated });
}
