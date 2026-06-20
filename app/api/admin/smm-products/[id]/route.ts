import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  platform: z.string().trim().min(1).max(30).optional(),
  category: z.enum(["MEMBERS", "VIEWS", "REACTIONS", "BOOST"]).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  pricePerThousand: z.number().int().min(0).optional(),
  minQty: z.number().int().min(1).optional(),
  maxQty: z.number().int().min(1).optional(),
  speedLabel: z.string().trim().min(1).max(50).optional(),
  externalServiceId: z.string().trim().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }
  if (Object.keys(parsed.data).length === 0) {
    return fail("수정할 내용이 없습니다");
  }

  const product = await prisma.smmProduct.update({
    where: { id: params.id },
    data: parsed.data,
  });
  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "SMM_PRODUCT_UPDATE",
    targetType: "SmmProduct",
    targetId: product.id,
    metadata: parsed.data,
  });
  return ok({ product });
}
