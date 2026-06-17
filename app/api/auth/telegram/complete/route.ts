import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { verifyTicket } from "@/lib/ticket";
import { walletAddressSchema } from "@/lib/validation";
import { toSessionUser } from "@/lib/serialize";
import { ok, fail, clientIp } from "@/lib/http";
import { z } from "zod";
import type { JWTPayload } from "jose";

const schema = z.object({
  ticket: z.string().min(1),
  walletAddress: walletAddressSchema,
  username: z.string().trim().min(3).max(20).optional(),
});

interface OnboardTicket extends JWTPayload {
  purpose?: string;
  telegramId?: string;
  telegramUsername?: string | null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
  }
  const { ticket, walletAddress } = parsed.data;

  const claims = await verifyTicket<OnboardTicket>(ticket);
  if (!claims || claims.purpose !== "tg-onboard" || !claims.telegramId) {
    return fail("온보딩 세션이 만료되었습니다. 다시 로그인해주세요", 401);
  }

  // Address must be unique across accounts.
  const dupWallet = await prisma.user.findUnique({ where: { walletAddress } });
  if (dupWallet) return fail("이미 등록된 지갑주소입니다", 409);

  const fallbackUsername =
    claims.telegramUsername || `tg_${claims.telegramId}`;
  const username = parsed.data.username ?? fallbackUsername;

  const dupName = await prisma.user.findUnique({ where: { username } });
  if (dupName) return fail("이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요", 409);

  const user = await prisma.user.create({
    data: {
      username,
      walletAddress,
      telegramId: claims.telegramId,
      telegramUsername: claims.telegramUsername ?? undefined,
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
  return ok({ user: toSessionUser(user), isNewUser: true }, { status: 201 });
}
