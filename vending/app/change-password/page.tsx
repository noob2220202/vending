"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "비밀번호 변경 실패");
      }
      setSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/"), 800);
    } catch (err: any) {
      setError(err?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center bg-no-repeat p-6">
      <Card className="w-full max-w-lg rounded-xl border border-white/30 bg-black/5 backdrop-blur-md shadow-md p-8">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-white">비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 pr-12 focus:border-white focus:ring-1 focus:ring-white"
              />
              <Button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-white bg-transparent hover:bg-transparent"
              >
                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">현재 비밀번호 표시 토글</span>
              </Button>
            </div>

            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 pr-12 focus:border-white focus:ring-1 focus:ring-white"
              />
              <Button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-white bg-transparent hover:bg-transparent"
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">새 비밀번호 표시 토글</span>
              </Button>
            </div>

            <Input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-black/20 text-white placeholder-black border border-white/50 rounded-lg h-14 px-4 focus:border-white focus:ring-1 focus:ring-white"
            />

            <Button type="submit" disabled={loading} className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white">
              {loading ? "변경 중..." : "변경하기"}
            </Button>
          </form>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-400">{success}</p>}
        </CardContent>
      </Card>
    </main>
  );
}


