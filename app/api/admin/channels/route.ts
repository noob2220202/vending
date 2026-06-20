import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(50),
  establishedYear: z.number().int().min(2000).max(2100),
  subscriberCount: z.number().int().min(0),
  price: z.number().int().min(0),
  description: z.string().trim().max(2000).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return fail("권한이 없습니다", 403);
  }

  const channels = await prisma.channelListing.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok({ channels });
}

export async function POST(req: Request) {
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }

  const channel = await prisma.channelListing.create({ data: parsed.data });
  return ok({ channel });
}
