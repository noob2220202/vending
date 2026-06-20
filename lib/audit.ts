import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuditEntry {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

// Accepts the shared singleton, a standalone PrismaClient (cron worker), or a
// $transaction callback's `tx` — all three expose the same `auditLog.create`.
type AuditClient = Pick<PrismaClient, "auditLog">;

/** Append-only trail for charge/order/admin actions (spec §13). */
export async function logAudit(entry: AuditEntry, client: AuditClient = prisma) {
  await client.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      actorRole: entry.actorRole ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    },
  });
}
