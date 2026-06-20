import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { config } from "@/lib/config";
import { getUsdtKrwRate } from "@/lib/exchange-rate";

const schema = z.object({
  krwAmount: z.number().int().min(1000).max(1_000_000),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return fail("로그인이 필요합니다", 401);
  }

  if (!config.tron.companyWallet) {
    return fail("충전 설정이 완료되지 않았습니다. 관리자에게 문의해주세요", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("잘못된 요청입니다");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("충전 금액을 확인해주세요 (1,000~1,000,000원)");
  }

  let rate: number;
  try {
    rate = await getUsdtKrwRate();
  } catch {
    return fail("환율 조회에 실패했습니다. 잠시 후 다시 시도해주세요", 502);
  }

  const quotedUsdt = Math.round((parsed.data.krwAmount / rate) * 100) / 100;
  const quoteExpiresAt = new Date(
    Date.now() + config.chargeQuoteMinutes * 60 * 1000
  );

  const chargeRequest = await prisma.chargeRequest.create({
    data: {
      userId: user.id,
      krwAmount: parsed.data.krwAmount,
      quotedRate: rate,
      quotedUsdt,
      quoteExpiresAt,
    },
  });

  return ok({
    chargeRequestId: chargeRequest.id,
    krwAmount: chargeRequest.krwAmount,
    quotedUsdt,
    quotedRate: rate,
    quoteExpiresAt,
    companyWallet: config.tron.companyWallet,
    usdtContract: config.tron.usdtContract,
    depositWalletAddress: user.walletAddress,
  });
}
