import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChannelCard } from "@/components/product/channel-card";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const SORTS = [
  { key: "year", label: "연식순" },
  { key: "subs", label: "구독자순" },
  { key: "price", label: "가격순" },
];

function orderBy(sort: string): Prisma.ChannelListingOrderByWithRelationInput {
  switch (sort) {
    case "subs":
      return { subscriberCount: "desc" };
    case "price":
      return { price: "asc" };
    default:
      return { establishedYear: "asc" };
  }
}

export default async function ChannelListPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = searchParams.sort ?? "year";
  const channels = await prisma.channelListing.findMany({
    where: { isActive: true },
    orderBy: orderBy(sort),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">연식 채널</h1>
      <p className="text-sm text-content-secondary">
        결제 후 24시간 내 운영자가 직접 소유권을 이전합니다.
      </p>

      <div className="flex gap-2">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/products/channels?sort=${s.key}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              sort === s.key
                ? "bg-accent text-white"
                : "bg-bg-card text-content-secondary hover:text-content-primary"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {channels.map((c) => (
          <ChannelCard key={c.id} c={c} />
        ))}
      </div>
      {channels.length === 0 && (
        <p className="py-10 text-center text-sm text-content-secondary">
          등록된 채널이 없습니다.
        </p>
      )}
    </div>
  );
}
