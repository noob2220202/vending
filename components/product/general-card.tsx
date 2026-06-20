import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/utils";

export interface GeneralCardData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export function GeneralCard({ p }: { p: GeneralCardData }) {
  const soldOut = p.stock <= 0;
  return (
    <Link href={`/products/general/${p.id}`}>
      <Card className="h-full transition hover:border-accent/50">
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{p.category}</Badge>
            {soldOut && <Badge tone="danger">품절</Badge>}
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold">{p.name}</h3>
          <p className="tnum text-lg font-bold text-accent">{formatKRW(p.price)}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
