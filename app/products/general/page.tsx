import { prisma } from "@/lib/prisma";
import { GeneralCard } from "@/components/product/general-card";
import { BannerSlot } from "@/components/banner-slot";

export const dynamic = "force-dynamic";

export default async function GeneralListPage() {
  const products = await prisma.generalProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">일반 상품</h1>
      <p className="text-sm text-content-secondary">
        운영자가 결제 후 직접 전달하는 상품입니다.
      </p>

      <BannerSlot slot="PRODUCT_LIST_TOP" />

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <GeneralCard key={p.id} p={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="py-10 text-center text-sm text-content-secondary">
          등록된 상품이 없습니다.
        </p>
      )}
    </div>
  );
}
