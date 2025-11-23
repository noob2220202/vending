"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Home, Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { useUserStore } from "@/store/userStore";
import { useMusicStore } from "@/store/musicStore";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = useUserStore((state: { user: any }) => state.user);
  const logout = useUserStore((state: any) => state.logout);
  const isMuted = useMusicStore((state) => state.isMuted);
  const toggleMute = useMusicStore((state) => state.toggleMute);

  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin") || ["/login", "/register"].includes(pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (hideNavbar) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white dark:bg-[#1b1e24] border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-11 w-11 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 lg:hidden"
            >
              <Menu className="h-[1.4rem] w-[1.4rem]" />
              <span className="sr-only">메뉴</span>
            </Button>
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              핵스팟
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center h-11 w-11 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors"
            >
              <Home className="h-[1.4rem] w-[1.4rem]" />
              <span className="sr-only">홈</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-11 w-11 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
            >
              {isMuted ? <VolumeX className="h-[1.4rem] w-[1.4rem]" /> : <Volume2 className="h-[1.4rem] w-[1.4rem]" />}
              <span className="sr-only">음소거 전환</span>
            </Button>
            <ThemeToggle />
            
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
            
            <div className="relative" ref={userMenuRef}>
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => {
                  if (!user || user.id === "비회원") {
                    setIsSidebarOpen(false);
                    router.push("/login");
                    return;
                  }
                  setIsUserMenuOpen((prev) => !prev);
                }}
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.id}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.money.toLocaleString()}원
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <Image
                    src="/avatar.png"
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-xl bg-white dark:bg-[#1b1e24] shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.id}님</div>
                    <span className="px-2 py-1 bg-teal-600 text-white text-xs rounded">{user?.role}</span>
                  </div>


                  <div className="pt-2 space-y-1 text-sm">
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        router.push("/purchase-history");
                        setIsUserMenuOpen(false);
                      }}
                    >
                      구매내역
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        router.push("/charge-history");
                        setIsUserMenuOpen(false);
                      }}
                    >
                      충전내역
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        router.push("/change-password");
                        setIsUserMenuOpen(false);
                      }}
                    >
                      비밀번호 변경
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    <button
                      className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!hideNavbar && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </>
  );
}
