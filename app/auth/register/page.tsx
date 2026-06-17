"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const isTelegram = params.get("tg") === "1";
  const { setUser } = useSession();

  const [form, setForm] = React.useState({
    username: "",
    password: "",
    walletAddress: "",
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res: Response;
      if (isTelegram) {
        const ticket = sessionStorage.getItem("tg-ticket");
        if (!ticket) {
          setError("온보딩 세션이 만료되었습니다. 다시 로그인해주세요.");
          return;
        }
        res = await fetch("/api/auth/telegram/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket,
            walletAddress: form.walletAddress,
            username: form.username || undefined,
          }),
        });
      } else {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다");
        return;
      }
      setUser(data.user);
      sessionStorage.removeItem("tg-ticket");
      // Trigger the post-signup roulette (1-hour window).
      if (data.isNewUser) sessionStorage.setItem("show-roulette", "1");
      router.push("/roulette");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold">
        {isTelegram ? "지갑주소 등록" : "회원가입"}
      </h1>
      <p className="mb-6 text-sm text-content-secondary">
        {isTelegram
          ? "마지막 단계예요. 충전·입금 매칭에 사용할 USDT-TRC20 지갑주소를 등록해주세요."
          : "가입 후 1시간 한정, 구매액 100% 매칭 적립 이벤트가 시작됩니다."}
      </p>

      <Card>
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Input
              label={isTelegram ? "아이디 (선택)" : "아이디"}
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="영문/숫자/밑줄 3~20자"
              hint={isTelegram ? "비워두면 텔레그램 사용자명으로 설정됩니다" : undefined}
            />
            {!isTelegram && (
              <Input
                label="비밀번호"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="6자 이상"
              />
            )}
            <Input
              label="USDT-TRC20 지갑주소"
              name="walletAddress"
              value={form.walletAddress}
              onChange={(e) =>
                setForm({ ...form, walletAddress: e.target.value })
              }
              placeholder="T로 시작하는 34자 주소"
              hint="이 주소에서 보낸 입금이 자동으로 충전 매칭됩니다 (1지갑 1계정)"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              loading={loading}
            >
              {isTelegram ? "가입 완료" : "가입하고 룰렛 돌리기"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {!isTelegram && (
        <p className="mt-4 text-center text-sm text-content-secondary">
          이미 회원이신가요?{" "}
          <Link href="/auth/login" className="font-medium text-accent">
            로그인
          </Link>
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={null}>
      <RegisterForm />
    </React.Suspense>
  );
}
