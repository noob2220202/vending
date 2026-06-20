import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(50),
  description: z.string().trim().max(2000).optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.string().trim().max(500).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  const products = await prisma.generalProduct.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok({ products });
}

export async function POST(req: Request) {
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }

  const product = await prisma.generalProduct.create({ data: parsed.data });
  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "GENERAL_PRODUCT_CREATE",
    targetType: "GeneralProduct",
    targetId: product.id,
  });
  return ok({ product });
}
