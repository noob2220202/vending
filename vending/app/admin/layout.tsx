"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNavbar from '@/components/admin-navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        const res = await fetch('/api/admin/verify', { cache: 'no-store' });
        if (res.ok) {
          if (!cancelled) setVerified(true);
        } else {
          if (!cancelled) router.replace('/admin/login');
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    verify();
    return () => { cancelled = true; };
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  if (checking) return null;
  if (!verified) return null;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
