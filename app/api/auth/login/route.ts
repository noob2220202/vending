import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { toSessionUser } from "@/lib/serialize";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("아이디와 비밀번호를 입력해주세요");

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) {
    return fail("아이디 또는 비밀번호가 올바르지 않습니다", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return fail("아이디 또는 비밀번호가 올바르지 않습니다", 401);

  await setSessionCookie(user.id);
  return ok({ user: toSessionUser(user) });
}
