import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().trim().max(500).optional(),
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

  const product = await prisma.generalProduct.update({
    where: { id: params.id },
    data: parsed.data,
  });
  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "GENERAL_PRODUCT_UPDATE",
    targetType: "GeneralProduct",
    targetId: product.id,
    metadata: parsed.data,
  });
  return ok({ product });
}
