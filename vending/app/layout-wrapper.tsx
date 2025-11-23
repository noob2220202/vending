"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMusicStore } from "@/store/musicStore";
import { useUserStore } from "@/store/userStore";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register"].includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");
  const initAudio = useMusicStore((state) => state.initAudio);
  const fetchUser = useUserStore((state: any) => state.fetchUser);

  useEffect(() => {
    initAudio();
    fetchUser().catch(() => {});
  }, [initAudio, fetchUser]);

  useEffect(() => {
    try {
      const storageKey = 'visitReportedAt';
      const today = new Date().toDateString();
      const last = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (last !== today) {
        fetch('/api/visitor', { method: 'POST' }).catch(() => {});
        if (typeof window !== 'undefined') localStorage.setItem(storageKey, today);
      }
    } catch {}
  }, []);

  return (
    <div className={isAuthPage || isAdminPage ? "" : "lg:ml-80"}>
      {children}
    </div>
  );
}

