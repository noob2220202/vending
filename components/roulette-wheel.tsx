"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Trophy, Gift, SealCheck, X, ArrowRight } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { ClickSpark } from "@/components/bits/click-spark";
import { Particles } from "@/components/bits/particles";
import { SplitText } from "@/components/bits/split-text";
import { useSession } from "@/components/providers";
import { formatKRW } from "@/lib/utils";
import type { RouletteCoupon, RouletteStatus } from "@/lib/types";

const SEGMENTS = [
  { id: "0", label: "꽝", color: "#1C2733" },
  { id: "1000", label: "1,000원", color: "#229ED9" },
  { id: "0", label: "꽝", color: "#1C2733" },
  { id: "5000", label: "5,000원", color: "#7C3AED" },
  { id: "0", label: "꽝", color: "#1C2733" },
  { id: "1000", label: "1,000원", color: "#229ED9" },
  { id: "0", label: "꽝", color: "#1C2733" },
  { id: "50000", label: "50,000원", color: "#F59E0B" },
];
const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const LABEL_RADIUS = 92;

function centerAngle(index: number) {
  return index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
}

function labelStyle(index: number): React.CSSProperties {
  const center = centerAngle(index);
  const theta = ((90 - center) * Math.PI) / 180;
  const x = LABEL_RADIUS * Math.cos(theta);
  const y = -LABEL_RADIUS * Math.sin(theta);
  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${center}deg)`,
  };
}

const wheelBackground = `conic-gradient(from 0deg, ${SEGMENTS.map(
  (s, i) => `${s.color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`
).join(", ")})`;

type Phase = "loading" | "idle" | "spinning" | "result";

export function RouletteWheel() {
  const router = useRouter();
  const { refresh } = useSession();
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [rotation, setRotation] = React.useState(0);
  const [spinMs, setSpinMs] = React.useState(4200);
  const [coupon, setCoupon] = React.useState<RouletteCoupon | null>(null);
  const [error, setError] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setSpinMs(reduceMotion ? 50 : 4200);
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/roulette", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { spun: false }))
      .then((d: RouletteStatus) => {
        if (!alive) return;
        if (d.spun) {
          const idx = SEGMENTS.findIndex((s) => s.id === d.resultSegment);
          if (idx >= 0) setRotation(360 * 3 + (360 - centerAngle(idx)));
          setCoupon(d.coupon ?? null);
          setPhase("result");
        } else {
          setPhase("idle");
        }
      })
      .catch(() => setPhase("idle"));
    return () => {
      alive = false;
    };
  }, []);

  async function spin() {
    if (phase !== "idle") return;
    setError("");
    setPhase("spinning");
    try {
      const res = await fetch("/api/roulette/spin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "스핀에 실패했습니다");
        setPhase("idle");
        return;
      }
      const idx = SEGMENTS.findIndex((s) => s.id === data.resultSegment);
      const safeIdx = idx >= 0 ? idx : SEGMENTS.length - 1;
      const jitter = (Math.random() - 0.5) * 20; // stays within the 45deg slice
      const spins = 6;
      setRotation(spins * 360 + (360 - centerAngle(safeIdx)) + jitter);
      window.setTimeout(() => {
        setCoupon(data.coupon ?? null);
        setPhase("result");
        setShowModal(true);
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#229ED9", "#7C3AED"],
        });
        refresh();
      }, spinMs);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요");
      setPhase("idle");
    }
  }

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <Badge tone="gradient" className="mb-4">
        가입 1시간 한정 이벤트
      </Badge>
      <h1 className="mb-2 text-2xl font-bold">
        <SplitText text="행운의 룰렛" />
      </h1>
      <p className="mb-8 text-sm text-content-secondary">
        지금 스핀하면 구매액의 100%를 포인트로 매칭 적립해드립니다.
        <br />
        (최대 50,000P, 1시간 내 구매시 자동 적용)
      </p>

      <Card glass className="relative overflow-hidden">
        <Particles />
        <div className="orb left-1/2 top-0 h-40 w-40 -translate-x-1/2 bg-growth-gradient" />
        <CardBody className="relative space-y-5 py-10">
          <div className="relative mx-auto h-60 w-60">
            <div
              aria-hidden
              className="absolute -top-1 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-warning"
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-[var(--glass-border)] shadow-xl"
              style={{
                background: wheelBackground,
                transform: `rotate(${rotation}deg)`,
                transition:
                  phase === "spinning"
                    ? `transform ${spinMs}ms cubic-bezier(0.12, 0.67, 0.1, 1)`
                    : undefined,
              }}
            >
              {SEGMENTS.map((s, i) => (
                <span
                  key={i}
                  className="tnum text-[11px] font-bold text-white/90"
                  style={labelStyle(i)}
                >
                  {s.label}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 m-auto grid h-10 w-10 place-items-center rounded-full bg-bg-base shadow-md">
              <Gift className="h-5 w-5 text-warning" weight="fill" />
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          {phase === "result" ? (
            <RouletteResult coupon={coupon} />
          ) : (
            <ClickSpark className="inline-block" sparkColor="#F59E0B">
              <Button
                variant="gradient"
                size="lg"
                className="px-10"
                loading={phase === "loading"}
                disabled={phase === "spinning" || phase === "loading"}
                onClick={spin}
              >
                {phase === "spinning" ? "돌리는 중..." : "스핀하기"}
              </Button>
            </ClickSpark>
          )}
        </CardBody>
      </Card>

      {showModal && coupon && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl glass-card noise-overlay p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Particles count={50} color="245,158,11" />
            <button
              aria-label="닫기"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 z-10 text-content-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative z-10 space-y-3">
              <Trophy className="mx-auto h-12 w-12 text-warning" weight="fill" />
              <h2 className="text-2xl font-bold">
                <SplitText text="50,000원 당첨!" />
              </h2>
              <p className="text-sm text-content-secondary">
                지금부터{" "}
                <Countdown
                  target={coupon.expiresAt}
                  className="tnum font-bold text-accent"
                />{" "}
                내 구매시, 구매액의 100%가 포인트로 매칭 적립됩니다.
              </p>
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => router.push("/products/smm")}
              >
                지금 구매하러 가기
                <ArrowRight className="h-4 w-4" weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RouletteResult({ coupon }: { coupon: RouletteCoupon | null }) {
  if (!coupon) {
    return (
      <p className="text-sm text-content-secondary">
        이미 룰렛에 참여하셨습니다.
      </p>
    );
  }

  if (coupon.status === "ACTIVE") {
    return (
      <div className="space-y-2">
        <Badge tone="success" className="mx-auto">
          <SealCheck className="h-3.5 w-3.5" weight="fill" /> 50,000원 당첨
        </Badge>
        <p className="text-sm text-content-secondary">
          구매액의 100% 매칭 적립 (최대 {formatKRW(coupon.maxBonus)}) ·{" "}
          <Countdown target={coupon.expiresAt} className="tnum font-semibold text-accent" />{" "}
          남음
        </p>
      </div>
    );
  }

  if (coupon.status === "USED") {
    return (
      <Badge tone="neutral" className="mx-auto">
        매칭 적립 쿠폰 사용완료
      </Badge>
    );
  }

  return (
    <Badge tone="danger" className="mx-auto">
      매칭 적립 쿠폰 만료됨
    </Badge>
  );
}
