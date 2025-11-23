"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, AlertTriangle, Calendar, FileText, Send, Loader2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emTitle, setEmTitle] = useState('');
  const [emContent, setEmContent] = useState('');
  const [emEndAt, setEmEndAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [emLoading, setEmLoading] = useState(false);

  const load = async () => {
    const r = await fetch('/api/admin/announcements');
    if (r.ok) { const j = await r.json(); setList(j.data || []); }
  };
  useEffect(() => { load(); }, []);

  const createAnnouncement = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/admin/announcements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content })
      });
      setTitle(''); setContent(''); await load();
    } finally {
      setLoading(false);
    }
  };

  const createEmergency = async () => {
    if (!emTitle.trim() || !emContent.trim()) return;
    setEmLoading(true);
    try {
      await fetch('/api/announcements/emergency', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: emTitle, content: emContent, end_at: emEndAt || undefined })
      });
      setEmTitle(''); setEmContent(''); setEmEndAt('');
    } finally {
      setEmLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-teal-600" />
            공지사항 관리
          </h1>
          <p className="text-muted-foreground">일반 공지와 긴급 공지를 작성하고 관리합니다</p>
        </div>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>일반 공지 작성</CardTitle>
                <CardDescription>사용자에게 전달할 공지사항을 작성합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>제목</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="예: 서버 점검 안내" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>내용</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="공지 내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all resize-none"
                  disabled={loading}
                />
              </div>
            </div>
            
            <Button 
              onClick={createAnnouncement} 
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  공지 등록
                </>
              )}
            </Button>

            {list.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">등록된 공지 ({list.length}개)</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {list.map((a) => (
                    <div key={a.id} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-base">{a.title}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                          {a.created_at && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-orange-900 dark:text-orange-100">긴급 공지 작성</CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  중요한 알림이나 장애 공지를 작성합니다
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>제목</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="예: 긴급 장애 안내" 
                  value={emTitle} 
                  onChange={(e) => setEmTitle(e.target.value)}
                  className="h-11 border-orange-300 dark:border-orange-700 focus:ring-orange-600"
                  disabled={emLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>내용</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="긴급 공지 내용을 입력하세요"
                  value={emContent}
                  onChange={(e) => setEmContent(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg border border-orange-300 dark:border-orange-700 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all resize-none"
                  disabled={emLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  종료 시각
                </label>
                <input
                  type="datetime-local"
                  value={emEndAt}
                  onChange={(e) => setEmEndAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="w-full h-11 rounded-lg border border-orange-300 dark:border-orange-700 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                  disabled={emLoading}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>💡</span>
                  미입력 시 기본 24시간 동안 표시됩니다.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={createEmergency}
              disabled={emLoading || !emTitle.trim() || !emContent.trim()}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {emLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  긴급 공지 등록
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
