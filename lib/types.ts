// Client-safe shapes shared between server and client components.

export interface SessionUser {
  id: string;
  username: string;
  walletAddress: string;
  telegramUsername: string | null;
  walletBalance: number;
  pointBalance: number;
  role: "USER" | "ADMIN";
}

export interface ActiveCoupon {
  id: string;
  type: "PERCENT_MATCH" | "FIXED";
  value: number;
  maxBonus: number;
  minSpend: number;
  expiresAt: string; // ISO
}
