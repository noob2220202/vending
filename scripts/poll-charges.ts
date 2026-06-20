// Standalone cron worker — NOT part of the Next.js server, so .env is not
// auto-loaded. Parse it manually (no dotenv dependency in this project) and
// dynamic-import everything else afterward so config.ts reads populated env.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(): void {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf-8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv();

const TOLERANCE = 0.005;

async function main() {
  const { PrismaClient, Prisma } = await import("@prisma/client");
  const { getIncomingUsdtTransfers } = await import("../lib/tron");
  const { notifyAdmin } = await import("../lib/notify");
  const { logAudit } = await import("../lib/audit");
  const prisma = new PrismaClient();

  try {
    const expired = await prisma.chargeRequest.updateMany({
      where: { status: "PENDING", quoteExpiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });
    if (expired.count > 0) {
      console.log(`[poll-charges] expired ${expired.count} stale quote(s)`);
    }

    const pending = await prisma.chargeRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
    });
    if (pending.length === 0) {
      console.log("[poll-charges] no pending charge requests");
      return;
    }

    const transfers = await getIncomingUsdtTransfers(200);

    for (const cr of pending) {
      const quoted = Number(cr.quotedUsdt);
      const match = transfers.find(
        (t) =>
          t.from === cr.user.walletAddress &&
          Math.abs(t.amountUsdt - quoted) / quoted <= TOLERANCE
      );
      if (!match) continue;

      try {
        await prisma.$transaction(async (tx) => {
          await tx.chargeRequest.update({
            where: { id: cr.id },
            data: {
              status: "CONFIRMED",
              matchType: "AUTO_SENDER_MATCH",
              matchedTxId: match.transactionId,
              actualUsdt: match.amountUsdt,
              finalRate: cr.quotedRate,
              finalKrw: cr.krwAmount,
              confirmedAt: new Date(),
            },
          });
          const afterCredit = await tx.user.update({
            where: { id: cr.userId },
            data: { walletBalance: { increment: cr.krwAmount } },
          });
          await tx.walletTransaction.create({
            data: {
              userId: cr.userId,
              type: "CHARGE",
              amount: cr.krwAmount,
              balanceAfter: afterCredit.walletBalance,
              memo: "USDT 충전 자동확인 (발신주소 매칭)",
            },
          });
        });
        await logAudit(
          {
            actorRole: "SYSTEM",
            action: "CHARGE_AUTO_CONFIRM",
            targetType: "ChargeRequest",
            targetId: cr.id,
            metadata: { krwAmount: cr.krwAmount, txId: match.transactionId },
          },
          prisma
        );
        console.log(`[poll-charges] confirmed ${cr.id} via tx ${match.transactionId}`);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          // matchedTxId already claimed (race with manual TXID submit) — expected.
          continue;
        }
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[poll-charges] failed to confirm ${cr.id}: ${msg}`);
        await notifyAdmin(`⚠️ 충전 자동확인 실패\nID: ${cr.id}\n오류: ${msg}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[poll-charges] fatal", err);
  process.exitCode = 1;
});
