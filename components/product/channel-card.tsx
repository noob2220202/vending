import Link from "next/link";
import { Users, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW, formatNumber } from "@/lib/utils";

export interface ChannelCardData {
  id: string;
  title: string;
  category: string;
  establishedYear: number;
  subscriberCount: number;
  price: number;
  status: string;
}

export function ChannelCard({ c }: { c: ChannelCardData }) {
  const sold = c.status !== "AVAILABLE";
  return (
    <Link href={`/products/channels/${c.id}`}>
      <Card className="h-full transition hover:border-accent/50">
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="gradient">{c.establishedYear}년 개설</Badge>
            <Badge tone="neutral">{c.category}</Badge>
            {sold && <Badge tone="danger">판매중</Badge>}
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold">{c.title}</h3>
          <div className="flex items-center gap-3 text-xs text-content-secondary">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="tnum">{formatNumber(c.subscriberCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              24시간 내 수동전달
            </span>
          </div>
          <p className="tnum text-lg font-bold text-accent">
            {formatKRW(c.price)}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
