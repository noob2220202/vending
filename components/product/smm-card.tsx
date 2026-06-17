import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW, formatNumber } from "@/lib/utils";

export interface SmmCardData {
  id: string;
  platform: string;
  category: string;
  name: string;
  pricePerThousand: number;
  minQty: number;
  speedLabel: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  MEMBERS: "멤버",
  VIEWS: "조회수",
  REACTIONS: "리액션",
  BOOST: "부스트",
};

export function SmmCard({ p }: { p: SmmCardData }) {
  return (
    <Link href={`/products/smm/${p.id}`}>
      <Card className="h-full transition hover:border-accent/50">
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{CATEGORY_LABEL[p.category] ?? p.category}</Badge>
            <Badge tone="success">{p.speedLabel}</Badge>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold">{p.name}</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-content-secondary">1,000개당</p>
              <p className="tnum text-lg font-bold text-accent">
                {formatKRW(p.pricePerThousand)}
              </p>
            </div>
            <p className="tnum text-xs text-content-secondary">
              최소 {formatNumber(p.minQty)}개
            </p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
