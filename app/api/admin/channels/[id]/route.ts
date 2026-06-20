import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  price: z.number().int().min(0).optional(),
  subscriberCount: z.number().int().min(0).optional(),
  status: z
    .enum(["AVAILABLE", "RESERVED", "PROCESSING", "DELIVERED", "SOLD"])
    .optional(),
  isActive: z.boolean().optional(),
  description: z.string().trim().max(2000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
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

  const channel = await prisma.channelListing.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return ok({ channel });
}
