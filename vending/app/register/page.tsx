"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useMusicStore } from "@/store/musicStore";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state: any) => state.setUser);

  const isMuted = useMusicStore((state) => state.isMuted);
  const toggleMute = useMusicStore((state) => state.toggleMute);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: username, password })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || '회원가입 실패');
      }
      setUser({
        ...result.data
      });
      router.push('/');
    } catch (err: any) {
      setError(err?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center bg-no-repeat p-6">
      <Card className="w-full max-w-lg rounded-xl border border-white/30 bg-black/5 backdrop-blur-md shadow-md p-8">
        <CardHeader>
          <CardTitle className="text-4xl text-center text-white">회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 focus:border-white focus:ring-1 focus:ring-white"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 pr-12 focus:border-white focus:ring-1 focus:ring-white"
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-white bg-transparent hover:bg-transparent"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">비밀번호 표시 토글</span>
              </Button>
            </div>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 pr-12 focus:border-white focus:ring-1 focus:ring-white"
              />
              <Button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-white bg-transparent hover:bg-transparent"
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">비밀번호 표시 토글</span>
              </Button>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white"
            >
              {loading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <p className="text-center text-sm text-white/80 mt-4">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all"
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        <span className="sr-only">음소거 전환</span>
      </Button>
    </main>
  );
}
