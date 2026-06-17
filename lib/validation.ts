import { z } from "zod";

// TRC20 addresses are Base58, start with 'T', length 34.
export const walletAddressSchema = z
  .string()
  .trim()
  .regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, "올바른 USDT-TRC20 지갑주소가 아닙니다");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "아이디는 3자 이상이어야 합니다")
  .max(20, "아이디는 20자 이하여야 합니다")
  .regex(/^[a-zA-Z0-9_]+$/, "영문/숫자/밑줄만 사용할 수 있습니다");

export const passwordSchema = z
  .string()
  .min(6, "비밀번호는 6자 이상이어야 합니다")
  .max(100);

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  walletAddress: walletAddressSchema,
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
