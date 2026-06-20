import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChartBar,
  CurrencyCircleDollar,
  Storefront,
  ClipboardText,
  Package,
} from "@phosphor-icons/react/ssr";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "대시보드", icon: ChartBar },
  { href: "/admin/charges", label: "충전요청", icon: CurrencyCircleDollar },
  { href: "/admin/products", label: "상품관리", icon: Package },
  { href: "/admin/channels", label: "연식채널", icon: Storefront },
  { href: "/admin/orders", label: "주문현황", icon: ClipboardText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">관리자</h1>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-bg-card px-3 py-2 text-xs font-medium text-content-secondary hover:bg-bg-elevated hover:text-content-primary"
          >
            <t.icon className="h-3.5 w-3.5" weight="bold" />
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
