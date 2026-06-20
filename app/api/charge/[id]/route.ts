import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { config } from "@/lib/config";
import { toChargeJson } from "@/lib/serialize";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  let cr = await prisma.chargeRequest.findUnique({ where: { id: params.id } });
  if (!cr || cr.userId !== user.id) {
    return fail("충전 요청을 찾을 수 없습니다", 404);
  }

  // Lazily flip stale quotes to EXPIRED on read, so polling clients see it promptly.
  if (cr.status === "PENDING" && cr.quoteExpiresAt < new Date()) {
    cr = await prisma.chargeRequest.update({
      where: { id: cr.id },
      data: { status: "EXPIRED" },
    });
  }

  return ok({
    chargeRequest: toChargeJson(cr),
    companyWallet: config.tron.companyWallet,
    usdtContract: config.tron.usdtContract,
  });
}
