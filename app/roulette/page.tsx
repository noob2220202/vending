import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SplitText } from "@/components/bits/split-text";
import { ClickSpark } from "@/components/bits/click-spark";
import { Particles } from "@/components/bits/particles";

// Placeholder — the interactive wheel + server-decided result land in Phase 2.
export default function RoulettePage() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <Badge tone="gradient" className="mb-4">
        가입 1시간 한정 이벤트
      </Badge>
      <h1 className="mb-2 text-2xl font-bold">
        <SplitText text="행운의 룰렛" />
      </h1>
      <p className="mb-8 text-sm text-content-secondary">
        룰렛 이벤트는 곧 오픈됩니다. (Phase 2)
        <br />
        지금은 상품을 먼저 둘러보세요.
      </p>
      <Card glass className="relative overflow-hidden">
        <Particles />
        <div className="orb left-1/2 top-0 h-40 w-40 -translate-x-1/2 bg-growth-gradient" />
        <CardBody className="relative space-y-4 py-10">
          <div className="mx-auto h-40 w-40 rounded-full border-4 border-dashed border-[var(--glass-border)]" />
          <ClickSpark className="inline-block">
            <Link
              href="/products/smm"
              className="inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white"
            >
              상품 보러가기
            </Link>
          </ClickSpark>
        </CardBody>
      </Card>
    </div>
  );
}
