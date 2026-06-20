import type { ChargeRequest, User } from "@prisma/client";
import type { SessionUser } from "./types";

/** Strip sensitive/non-serializable fields before sending a user to the client. */
export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    username: user.username,
    walletAddress: user.walletAddress,
    telegramUsername: user.telegramUsername,
    walletBalance: user.walletBalance,
    pointBalance: user.pointBalance,
    role: user.role as SessionUser["role"],
  };
}

/** Prisma Decimal fields don't survive NextResponse.json cleanly — convert to plain numbers. */
export function toChargeJson(cr: ChargeRequest) {
  return {
    ...cr,
    quotedUsdt: Number(cr.quotedUsdt),
    actualUsdt: cr.actualUsdt !== null ? Number(cr.actualUsdt) : null,
  };
}
