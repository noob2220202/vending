import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const orders = await prisma.order.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { username: true } },
      smmProduct: true,
      channelListing: true,
      generalProduct: true,
    },
  });
  return ok({ orders });
}
