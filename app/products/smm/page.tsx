import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SmmCard } from "@/components/product/smm-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "", label: "전체" },
  { key: "MEMBERS", label: "멤버" },
  { key: "VIEWS", label: "조회수" },
  { key: "REACTIONS", label: "리액션" },
  { key: "BOOST", label: "부스트" },
];

export default async function SmmListPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category ?? "";
  const products = await prisma.smmProduct.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    orderBy: { pricePerThousand: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">SMM 상품</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={c.key ? `/products/smm?category=${c.key}` : "/products/smm"}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              category === c.key
                ? "bg-accent text-white"
                : "bg-bg-card text-content-secondary hover:text-content-primary"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <SmmCard key={p.id} p={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="py-10 text-center text-sm text-content-secondary">
          해당 카테고리에 상품이 없습니다.
        </p>
      )}
    </div>
  );
}
