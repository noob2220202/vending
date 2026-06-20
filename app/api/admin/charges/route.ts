import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { toChargeJson } from "@/lib/serialize";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  const status = new URL(req.url).searchParams.get("status");
  const chargeRequests = await prisma.chargeRequest.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { username: true, walletAddress: true } } },
  });

  return ok({
    chargeRequests: chargeRequests.map((cr) => ({
      ...toChargeJson(cr),
      user: cr.user,
    })),
  });
}
