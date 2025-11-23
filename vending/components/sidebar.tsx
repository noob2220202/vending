"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { ChargeModal } from "@/components/charge-modal";
import { PassModal } from "@/components/pass-modal";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isChargeOpen, setIsChargeOpen] = React.useState(false);
  const [isPassOpen, setIsPassOpen] = React.useState(false);
  const router = useRouter();
  const user = useUserStore((state: any) => state.user);
  const visitorStats = useUserStore((state: any) => state.visitorStats);
  const categories = useUserStore((state: any) => state.categories);
  const fetchUser = useUserStore((state: any) => state.fetchUser);
  const fetchVisitorStats = useUserStore((state: any) => state.fetchVisitorStats);
  const fetchCategories = useUserStore((state: any) => state.fetchCategories);
  
  const handleRefreshBalance = async () => {
    if (user?.id && user.id !== "비회원") {
      await fetchUser();
    }
  };

  const handleChargeClick = async () => {
    try {
      if (!user || user.id === '비회원') {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/user/verified');
      const data = await res.json();
      
      if (data.verified) {
        setIsChargeOpen(true);
      } else {
        setIsPassOpen(true);
      }
    } catch (error) {
      setIsPassOpen(true);
    }
  };

  const handlePassVerified = () => {
    setIsPassOpen(false);
    setIsChargeOpen(true);
  };

  React.useEffect(() => {
    fetchVisitorStats();
    fetchCategories();
  }, [fetchVisitorStats, fetchCategories]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-50 dark:bg-[#1a1d23] transform transition-transform duration-300 z-50 lg:z-30 border-r border-gray-200 dark:border-gray-700
        lg:translate-x-0 lg:pt-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
                  <Image 
                    src="/avatar.png"
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold">{user?.id}</h2>
                <span className="px-2 py-1 bg-teal-600 text-white text-xs rounded">
                  {user?.role}
                </span>
              </div>

              <div className="w-full bg-white dark:bg-[#252932] rounded-lg p-4 mb-4 border border-gray-200 dark:border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">보유금액</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-semibold">{user?.money.toLocaleString()}원</span>
                    <RefreshCw 
                      className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" 
                      onClick={handleRefreshBalance}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={handleChargeClick}>
                  {!user || user.id === '비회원' ? '로그인' : '충전하기'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/purchase-history" className="w-full">
                    <Button variant="outline" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none">
                      구매내역
                    </Button>
                  </Link>
                  <Link href="/charge-history" className="w-full">
                    <Button variant="outline" className="w-full bg-teal-700 hover:bg-teal-800 text-white border-none">
                      충전내역
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-3 px-2">상품목록</h3>
            <nav className="space-y-1">
              {categories.length > 0 ? (
                categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.name}`} 
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-500 text-sm">
                  등록된 카테고리가 없습니다
                </div>
              )}
            </nav>
          </div>

          <div className="px-4 py-6">
            <div className="bg-white dark:bg-[#252932] border border-gray-200 dark:border-transparent rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                  Today
                </span>
                <span className="text-red-500 dark:text-red-400 text-2xl font-bold">{visitorStats.today.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-600 dark:text-gray-400 text-sm">이번주 방문자</span>
                <span className="text-gray-900 dark:text-white font-semibold">{visitorStats.thisWeek.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm">이번달 방문자</span>
                <span className="text-gray-900 dark:text-white font-semibold">{visitorStats.thisMonth.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PassModal open={isPassOpen} onOpenChange={setIsPassOpen} onVerified={handlePassVerified} />
      <ChargeModal open={isChargeOpen} onOpenChange={setIsChargeOpen} />
    </>
  );
}

