import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  PENDING: { label: "대기", tone: "neutral" },
  PROCESSING: { label: "처리중", tone: "warning" },
  COMPLETED: { label: "완료", tone: "success" },
  CANCELED: { label: "취소", tone: "danger" },
  REFUNDED: { label: "환불", tone: "neutral" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
