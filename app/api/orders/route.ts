import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { smmPrice } from "@/lib/utils";
import { applyCouponMatch } from "@/lib/orders";
import { notifyAdmin } from "@/lib/notify";
import { ok, fail } from "@/lib/http";

const itemSchema = z.object({
  type: z.enum(["SMM", "CHANNEL"]),
  refId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  targetUrl: z.string().trim().url().optional(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
});

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { smmProduct: true, channelListing: true },
  });
  return ok({ orders });
}

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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "주문 항목을 확인해주세요");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Re-price everything from the DB (never trust client amounts).
      const lines: {
        type: "SMM" | "CHANNEL";
        refId: string;
        amount: number;
        quantity?: number;
        targetUrl?: string;
      }[] = [];

      for (const item of parsed.data.items) {
        if (item.type === "SMM") {
          const product = await tx.smmProduct.findUnique({
            where: { id: item.refId },
          });
          if (!product || !product.isActive) {
            throw new Error("판매 중이지 않은 상품이 포함되어 있습니다");
          }
          const qty = item.quantity ?? 0;
          if (qty < product.minQty || qty > product.maxQty) {
            throw new Error(`${product.name}: 수량 범위를 벗어났습니다`);
          }
          if (!item.targetUrl) {
            throw new Error(`${product.name}: 대상 링크가 필요합니다`);
          }
          lines.push({
            type: "SMM",
            refId: product.id,
            amount: smmPrice(qty, product.pricePerThousand),
            quantity: qty,
            targetUrl: item.targetUrl,
          });
        } else {
          const channel = await tx.channelListing.findUnique({
            where: { id: item.refId },
          });
          if (!channel || !channel.isActive) {
            throw new Error("판매 중이지 않은 채널이 포함되어 있습니다");
          }
          if (channel.status !== "AVAILABLE") {
            throw new Error(`${channel.title}: 이미 판매된 채널입니다`);
          }
          lines.push({
            type: "CHANNEL",
            refId: channel.id,
            amount: channel.price,
          });
        }
      }

      const total = lines.reduce((s, l) => s + l.amount, 0);

      // 2) Check + deduct wallet balance.
      const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      if (fresh.walletBalance < total) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      const afterDebit = await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: total } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "PURCHASE",
          amount: -total,
          balanceAfter: afterDebit.walletBalance,
          memo: `주문 결제 (${lines.length}건)`,
        },
      });

      // 3) Create orders + reserve channel stock.
      const createdIds: string[] = [];
      const channelTitles: string[] = [];
      for (const l of lines) {
        if (l.type === "SMM") {
          // Phase 1: no external SMM API yet → PROCESSING (auto-completed in Phase 3).
          const order = await tx.order.create({
            data: {
              userId: user.id,
              type: "SMM",
              status: "PROCESSING",
              smmProductId: l.refId,
              quantity: l.quantity,
              targetUrl: l.targetUrl,
              amount: l.amount,
            },
          });
          createdIds.push(order.id);
        } else {
          // Atomic claim: only succeeds if still AVAILABLE.
          const claimed = await tx.channelListing.updateMany({
            where: { id: l.refId, status: "AVAILABLE" },
            data: {
              status: "PROCESSING",
              deliveryDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });
          if (claimed.count === 0) {
            throw new Error("채널이 방금 판매되었습니다. 다시 시도해주세요");
          }
          const order = await tx.order.create({
            data: {
              userId: user.id,
              type: "CHANNEL",
              status: "PROCESSING",
              channelListingId: l.refId,
              amount: l.amount,
            },
          });
          createdIds.push(order.id);
          const ch = await tx.channelListing.findUnique({
            where: { id: l.refId },
          });
          if (ch) channelTitles.push(ch.title);
        }
      }

      // 4) Coupon match bonus (no-op until a coupon exists).
      const bonus = await applyCouponMatch(tx, user.id, total);
      if (bonus > 0 && createdIds.length > 0) {
        await tx.order.update({
          where: { id: createdIds[0] },
          data: { bonusEarned: bonus },
        });
      }

      return { total, bonus, channelTitles, orderCount: createdIds.length };
    });

    // Side effects after the transaction commits.
    if (result.channelTitles.length > 0) {
      await notifyAdmin(
        `🆕 연식채널 주문 (수동전달 필요)\n사용자: ${user.username}\n채널: ${result.channelTitles.join(", ")}\n마감: 24시간 내`
      );
    }

    return ok({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "주문 처리에 실패했습니다";
    if (msg === "INSUFFICIENT_BALANCE") {
      return fail("잔액이 부족합니다. 충전 후 다시 시도해주세요", 402);
    }
    return fail(msg, 400);
  }
}
