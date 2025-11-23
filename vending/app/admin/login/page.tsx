"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '로그인 실패');
      }
      router.replace('/admin');
    } catch (e: any) {
      setError(e.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-teal-950/20 dark:to-cyan-950/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-xl shadow-teal-600/30">
              <Shield className="w-9 h-9 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">관리자 계정으로 로그인하세요</p>
          </div>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>관리자 권한이 필요합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  아이디
                </label>
                <Input 
                  placeholder="아이디를 입력하세요" 
                  value={id} 
                  onChange={(e) => setId(e.target.value)}
                  className="h-11"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  비밀번호
                </label>
                <Input 
                  placeholder="비밀번호를 입력하세요" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !id.trim() || !password.trim()} 
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium shadow-lg shadow-teal-600/30"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    확인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
