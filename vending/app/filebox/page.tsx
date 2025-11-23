"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  size: number;
  mime: string;
  created_at: string;
}

export default function FileBoxPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const user = useUserStore((s: any) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.id === '비회원') {
      router.push('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/filebox');
        const result = await res.json();
        if (result.success) setFiles(result.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', f);
      const res = await fetch('/api/filebox', { method: 'POST', body: form });
      const result = await res.json();
      if (result.success) {
        const list = await fetch('/api/filebox').then(r => r.json());
        if (list.success) setFiles(list.data);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <main className="min-h-screen p-6 pt-28 lg:pt-24">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-muted/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">파일함</CardTitle>
            <div>
              <input type="file" onChange={onUpload} disabled={uploading} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-foreground text-xl">로딩 중...</div>
            ) : files.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">파일이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                <div className="hidden lg:grid grid-cols-4 gap-4 p-3 bg-accent/50 rounded-lg font-semibold text-sm">
                  <div>파일명</div>
                  <div>용량</div>
                  <div>MIME</div>
                  <div>업로드일</div>
                </div>
                {files.map(f => (
                  <Card key={f.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
                        <div className="text-foreground font-medium">
                          <a href={`/files/${f.filename}`} download>{f.original_name}</a>
                        </div>
                        <div className="text-foreground">{(f.size/1024).toFixed(1)} KB</div>
                        <div className="text-muted-foreground text-sm">{f.mime}</div>
                        <div className="text-muted-foreground text-sm">{new Date(f.created_at).toLocaleString('ko-KR')}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


