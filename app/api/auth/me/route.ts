import { getCurrentUser } from "@/lib/auth";
import { toSessionUser } from "@/lib/serialize";
import { ok } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user: user ? toSessionUser(user) : null });
}
