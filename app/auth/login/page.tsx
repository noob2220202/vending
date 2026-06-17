"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TelegramLoginButton } from "@/components/telegram-login-button";
import { useSession } from "@/components/providers";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [form, setForm] = React.useState({ username: "", password: "" });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다");
        return;
      }
      setUser(data.user);
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const onTelegram = React.useCallback(
    async (payload: Record<string, unknown>) => {
      setError("");
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.needsOnboarding) {
        sessionStorage.setItem("tg-ticket", data.ticket);
        router.push("/auth/register?tg=1");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "텔레그램 로그인에 실패했습니다");
        return;
      }
      setUser(data.user);
      router.push("/");
      router.refresh();
    },
    [router, setUser]
  );

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold">로그인</h1>
      <p className="mb-6 text-sm text-content-secondary">
        티지마켓에 오신 것을 환영합니다
      </p>

      <Card>
        <CardBody className="space-y-4">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="아이디"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="아이디"
            />
            <Input
              label="비밀번호"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              로그인
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-content-secondary">
            <span className="h-px flex-1 bg-[var(--glass-border)]" />
            또는
            <span className="h-px flex-1 bg-[var(--glass-border)]" />
          </div>

          <TelegramLoginButton onAuth={onTelegram} />
        </CardBody>
      </Card>

      <p className="mt-4 text-center text-sm text-content-secondary">
        아직 회원이 아니신가요?{" "}
        <Link href="/auth/register" className="font-medium text-accent">
          회원가입
        </Link>
      </p>
    </div>
  );
}
