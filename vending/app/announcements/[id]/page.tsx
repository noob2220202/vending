"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/announcements/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('failed');
        return r.json();
      })
      .then((json) => !cancelled && setItem(json?.data || null))
      .catch(() => !cancelled && setError('불러오기에 실패했습니다.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-screen-2xl mx-auto">
      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>공지 상세</CardTitle>
          <Button variant="outline" onClick={() => router.push('/announcements')}>목록으로</Button>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-gray-500">불러오는 중...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {item && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{item.title}</h1>
              <div className="text-sm text-gray-500 mt-1">{new Date(item.created_at).toLocaleString()}</div>
              <div className="mt-6 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{item.content}</div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


