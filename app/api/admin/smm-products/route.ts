import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  platform: z.string().trim().min(1).max(30),
  category: z.enum(["MEMBERS", "VIEWS", "REACTIONS", "BOOST"]),
  name: z.string().trim().min(1).max(200),
  pricePerThousand: z.number().int().min(0),
  minQty: z.number().int().min(1),
  maxQty: z.number().int().min(1),
  speedLabel: z.string().trim().min(1).max(50),
  externalServiceId: z.string().trim().min(1).max(50),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  const products = await prisma.smmProduct.findMany({
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
  if (parsed.data.minQty > parsed.data.maxQty) {
    return fail("최소 수량은 최대 수량보다 클 수 없습니다");
  }

  const product = await prisma.smmProduct.create({ data: parsed.data });
  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: "SMM_PRODUCT_CREATE",
    targetType: "SmmProduct",
    targetId: product.id,
  });
  return ok({ product });
}
