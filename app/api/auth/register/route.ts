import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { toSessionUser } from "@/lib/serialize";
import { ok, fail, clientIp } from "@/lib/http";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }
  const { username, password, walletAddress } = parsed.data;

  const dup = await prisma.user.findFirst({
    where: { OR: [{ username }, { walletAddress }] },
    select: { username: true, walletAddress: true },
  });
  if (dup) {
    if (dup.username === username) return fail("이미 사용 중인 아이디입니다", 409);
    return fail("이미 등록된 지갑주소입니다", 409);
  }

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      walletAddress,
    },
  });

  await prisma.signupLog.create({
    data: {
      userId: user.id,
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  await setSessionCookie(user.id);
  // isNewUser drives the post-signup roulette modal on the client.
  return ok({ user: toSessionUser(user), isNewUser: true }, { status: 201 });
}
