"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  Copy,
  CheckCircle,
  WarningCircle,
  ArrowsClockwise,
  Hourglass,
} from "@phosphor-icons/react/ssr";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/ui/countdown";
import { useSession } from "@/components/providers";
import { cn, formatKRW } from "@/lib/utils";

const PRESETS = [10000, 30000, 50000, 100000];

interface ChargeRequestData {
  id: string;
  status: string;
  krwAmount: number;
  quotedUsdt: number;
  quoteExpiresAt: string;
  createdAt: string;
}

interface QuoteResponse {
  chargeRequestId: string;
  krwAmount: number;
  quotedUsdt: number;
  quoteExpiresAt: string;
  companyWallet: string;
  usdtContract: string;
  depositWalletAddress: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "입금 대기중",
  CONFIRMED: "충전 완료",
  MISMATCHED: "금액 불일치",
  EXPIRED: "만료됨",
  REJECTED: "거절됨",
};

function statusTone(status: string): "success" | "warning" | "danger" {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  return "danger";
}

export default function ChargePage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const [amount, setAmount] = React.useState(30000);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
  const [status, setStatus] = React.useState("PENDING");
  const [txId, setTxId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitMsg, setSubmitMsg] = React.useState("");
  const [copied, setCopied] = React.useState<"wallet" | "amount" | null>(null);
  const [history, setHistory] = React.useState<ChargeRequestData[]>([]);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/charge", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.chargeRequests ?? []);
      }
    } catch {
      // network hiccup: keep current list
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // While a quote is pending, poll for the auto-match worker confirming it.
  React.useEffect(() => {
    if (!quote || status !== "PENDING") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/charge/${quote.chargeRequestId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const next = data.chargeRequest?.status;
        if (next && next !== status) {
          setStatus(next);
          if (next === "CONFIRMED") {
            await refresh();
            await loadHistory();
          }
        }
      } catch {
        // transient network error: retry on next tick
      }
    }, 5000);
    return () => clearInterval(id);
  }, [quote, status, refresh, loadHistory]);

  async function requestQuote() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/charge/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ krwAmount: amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "견적 요청에 실패했습니다");
        return;
      }
      setQuote(data);
      setStatus("PENDING");
      setSubmitMsg("");
      setTxId("");
    } finally {
      setLoading(false);
    }
  }

  async function submitTxId() {
    if (!quote || !txId.trim()) return;
    setSubmitMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/charge/submit-txid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargeRequestId: quote.chargeRequestId,
          txId: txId.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg(data.error ?? "확인에 실패했습니다");
        if (data.chargeRequest?.status) setStatus(data.chargeRequest.status);
        return;
      }
      setStatus(data.chargeRequest?.status ?? "CONFIRMED");
      await refresh();
      await loadHistory();
    } finally {
      setSubmitting(false);
    }
  }

  function copy(text: string, which: "wallet" | "amount") {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function reset() {
    setQuote(null);
    setStatus("PENDING");
    setSubmitMsg("");
    setTxId("");
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">충전</h1>

      {user && (
        <p className="text-sm text-content-secondary">
          현재 잔액{" "}
          <span className="tnum font-semibold text-content-primary">
            {formatKRW(user.walletBalance)}
          </span>
        </p>
      )}

      {!quote ? (
        <>
          <Card glass>
            <CardBody className="flex items-start gap-2 text-xs text-content-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" weight="fill" />
              <p>
                USDT-TRC20으로 충전합니다. 가입 시 등록한 본인 지갑주소에서
                정확한 수량을 보내면 자동으로 확인되며, 빠른 확인이 필요하면
                전송 후 TXID를 직접 제출할 수 있습니다.
              </p>
            </CardBody>
          </Card>

          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={cn(
                  "tnum rounded-xl py-2.5 text-sm font-medium transition",
                  amount === v
                    ? "bg-accent text-white"
                    : "bg-bg-card text-content-secondary"
                )}
              >
                {v.toLocaleString("ko-KR")}
              </button>
            ))}
          </div>

          <Input
            label="충전 금액 (원)"
            type="number"
            inputMode="numeric"
            value={amount}
            min={1000}
            max={1000000}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="tnum"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            variant="gradient"
            className="w-full"
            loading={loading}
            onClick={requestQuote}
          >
            {formatKRW(amount)} 견적 받기
          </Button>
        </>
      ) : (
        <>
          <Card glass>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge tone={statusTone(status)}>
                  {STATUS_LABEL[status] ?? status}
                </Badge>
                {status === "PENDING" && (
                  <span className="tnum flex items-center gap-1 text-xs text-content-secondary">
                    <Hourglass className="h-3.5 w-3.5" />
                    <Countdown
                      target={quote.quoteExpiresAt}
                      onExpire={() => setStatus("EXPIRED")}
                    />
                  </span>
                )}
              </div>

              {status === "CONFIRMED" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle className="h-10 w-10 text-success" weight="fill" />
                  <p className="text-sm font-semibold">
                    {formatKRW(quote.krwAmount)} 충전이 완료되었습니다
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push("/mypage")}
                  >
                    마이페이지로 이동
                  </Button>
                </div>
              ) : status === "EXPIRED" ||
                status === "MISMATCHED" ||
                status === "REJECTED" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <WarningCircle className="h-10 w-10 text-danger" weight="fill" />
                  <p className="text-sm font-semibold">{STATUS_LABEL[status]}</p>
                  <Button variant="secondary" size="sm" onClick={reset}>
                    다시 시도하기
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-content-secondary">
                      보낼 수량 (USDT-TRC20)
                    </p>
                    <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-3.5 py-3">
                      <span className="tnum text-lg font-bold text-accent">
                        {quote.quotedUsdt} USDT
                      </span>
                      <button
                        onClick={() => copy(String(quote.quotedUsdt), "amount")}
                        className="text-content-secondary"
                        aria-label="수량 복사"
                      >
                        {copied === "amount" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-content-secondary">
                      받는 지갑주소 (TRC20)
                    </p>
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-bg-elevated px-3.5 py-3">
                      <span className="break-all font-mono text-xs">
                        {quote.companyWallet}
                      </span>
                      <button
                        onClick={() => copy(quote.companyWallet, "wallet")}
                        className="shrink-0 text-content-secondary"
                        aria-label="주소 복사"
                      >
                        {copied === "wallet" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-content-secondary">
                    ⚠️ 반드시 가입 시 등록한 본인 지갑주소(
                    <span className="font-mono">
                      {quote.depositWalletAddress.slice(0, 10)}...
                    </span>
                    )에서 위 금액을 정확히 보내주세요. 다른 주소에서 보내면
                    자동확인이 되지 않으니 TXID를 직접 제출해주세요.
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                    <ArrowsClockwise className="h-3.5 w-3.5 animate-spin" />
                    입금을 자동으로 확인하는 중입니다...
                  </div>

                  <div className="space-y-2 border-t border-[var(--glass-border)] pt-3">
                    <Input
                      label="전송 후 TXID 직접 제출 (선택, 즉시확인)"
                      placeholder="TRON 트랜잭션 해시"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                    />
                    {submitMsg && <p className="text-xs text-danger">{submitMsg}</p>}
                    <Button
                      variant="secondary"
                      className="w-full"
                      loading={submitting}
                      disabled={!txId.trim()}
                      onClick={submitTxId}
                    >
                      TXID로 즉시 확인
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {status === "PENDING" && (
            <button
              onClick={reset}
              className="w-full text-center text-xs text-content-secondary"
            >
              취소하고 다시 입력하기
            </button>
          )}
        </>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-bold">충전내역</h2>
          {history.map((h) => (
            <Card key={h.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="tnum text-sm font-semibold">
                    {formatKRW(h.krwAmount)}
                  </p>
                  <p className="tnum text-xs text-content-secondary">
                    {new Date(h.createdAt).toLocaleString("ko-KR")} ·{" "}
                    {h.quotedUsdt} USDT
                  </p>
                </div>
                <Badge tone={statusTone(h.status)}>
                  {STATUS_LABEL[h.status] ?? h.status}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
