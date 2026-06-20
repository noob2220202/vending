"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Coins, ShoppingCart, Lightning } from "@phosphor-icons/react/ssr";
import { useSession } from "@/components/providers";
import { useCart } from "@/store/cart";
import { formatNumber } from "@/lib/utils";
import { CouponCountdown } from "@/components/coupon-countdown";

export function Header() {
  const { user, setUser } = useSession();
  const router = useRouter();
  const count = useCart((s) => s.items.length);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 safe-top border-b border-[var(--glass-border)] glass">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-1.5 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-growth-gradient">
            <Lightning className="h-4 w-4 text-white" weight="fill" />
          </span>
          <span className="text-[15px]">티지마켓</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <CouponCountdown />

          {user ? (
            <>
              <Link
                href="/mypage"
                className="hidden items-center gap-3 rounded-xl bg-bg-elevated px-3 py-1.5 text-xs sm:flex"
              >
                <span className="flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-accent" weight="bold" />
                  <span className="tnum font-semibold">
                    {formatNumber(user.walletBalance)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-warning" weight="bold" />
                  <span className="tnum font-semibold">
                    {formatNumber(user.pointBalance)}
                  </span>
                </span>
              </Link>

              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5" weight="bold" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                className="rounded-lg px-2 py-1.5 text-xs text-content-secondary hover:text-content-primary"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
