import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { verifyTelegramLogin, type TelegramAuthData } from "@/lib/telegram-auth";
import { signTicket } from "@/lib/ticket";
import { config } from "@/lib/config";
import { toSessionUser } from "@/lib/serialize";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  if (!config.telegram.loginBotToken) {
    return fail("텔레그램 로그인이 설정되지 않았습니다", 503);
  }

  let data: TelegramAuthData;
  try {
    data = (await req.json()) as TelegramAuthData;
  } catch {
    return fail("잘못된 요청입니다");
  }

  if (!verifyTelegramLogin(data, config.telegram.loginBotToken)) {
    return fail("텔레그램 인증 검증에 실패했습니다", 401);
  }

  const existing = await prisma.user.findUnique({
    where: { telegramId: data.id },
  });

  if (existing) {
    await setSessionCookie(existing.id);
    return ok({ user: toSessionUser(existing) });
  }

  // New telegram user: still requires a wallet address (anti-abuse).
  // Hand off a verified, short-lived ticket to the onboarding step.
  const ticket = await signTicket({
    purpose: "tg-onboard",
    telegramId: data.id,
    telegramUsername: data.username ?? null,
  });
  return ok({ needsOnboarding: true, ticket });
}
