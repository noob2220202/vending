import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { toChargeJson } from "@/lib/serialize";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  const chargeRequests = await prisma.chargeRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return ok({ chargeRequests: chargeRequests.map(toChargeJson) });
}
