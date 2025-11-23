"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AnnouncementsPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/announcements?limit=50')
      .then(async (r) => {
        if (!r.ok) throw new Error('failed');
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(Array.isArray(json) ? json : []);
      })
      .catch(() => !cancelled && setError('불러오기에 실패했습니다.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-screen-2xl mx-auto">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>공지사항</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-gray-500">불러오는 중...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {(data ?? []).map((item: any) => (
              <li key={item.id} className="py-4">
                <Link href={`/announcements/${item.id}`} className="block group">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white font-medium group-hover:underline">{item.title}</span>
                    <span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{item.content.length > 10 ? item.content.slice(0, 10) + "..." : item.content}</p>
                </Link>
              </li>
            ))}
            {data && data.length === 0 && (
              <li className="py-8 text-center text-gray-500">등록된 공지사항이 없습니다.</li>
            )}
          </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


