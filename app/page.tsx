import Link from "next/link";
import { ArrowRight, Lightning, Radio, Package } from "@phosphor-icons/react/ssr";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmmCard } from "@/components/product/smm-card";
import { ChannelCard } from "@/components/product/channel-card";
import { SocialProofToast } from "@/components/social-proof-toast";
import { BannerSlot } from "@/components/banner-slot";
import { Aurora } from "@/components/bits/aurora";
import { BlurText } from "@/components/bits/blur-text";
import { GradientText } from "@/components/bits/gradient-text";
import { AnimatedContent } from "@/components/bits/animated-content";
import { StarBorder } from "@/components/bits/star-border";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [smm, channels] = await Promise.all([
    prisma.smmProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    prisma.channelListing.findMany({
      where: { isActive: true, status: "AVAILABLE" },
      orderBy: { establishedYear: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl">
        <Aurora />
        <Card glass className="noise-overlay border-0">
          <CardBody className="space-y-4 py-8">
            <Badge tone="gradient">첫 가입 1시간 한정</Badge>
            <h1 className="font-display text-2xl font-bold leading-snug">
              <BlurText text="구매액" /> <GradientText animate>100% 매칭 적립</GradientText>
              <br />
              <BlurText text="지금 가입하고 룰렛 돌리기" />
            </h1>
            <p className="text-sm text-content-secondary">
              텔레그램 멤버·조회수·리액션부터 연식 채널까지, 한 곳에서.
            </p>
            <div className="flex gap-2">
              <StarBorder>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1 rounded-2xl bg-growth-gradient px-4 py-2.5 text-sm font-semibold text-white"
                >
                  가입하고 룰렛 <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
              </StarBorder>
              <Link
                href="/products/smm"
                className="inline-flex items-center rounded-xl bg-bg-card px-4 py-2.5 text-sm font-medium"
              >
                상품 둘러보기
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>

      <BannerSlot slot="HOME_HERO" />

      {/* Segment tabs */}
      <section className="grid grid-cols-3 gap-3">
        <AnimatedContent direction="up">
          <Link href="/products/smm">
            <Card className="transition hover:border-accent/50">
              <CardBody className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15">
                  <Lightning className="h-5 w-5 text-accent" weight="fill" />
                </span>
                <div>
                  <p className="text-sm font-semibold">SMM 패널</p>
                  <p className="text-xs text-content-secondary">자동·즉시 처리</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </AnimatedContent>
        <AnimatedContent direction="up" delay={0.05}>
          <Link href="/products/channels">
            <Card className="transition hover:border-accent/50">
              <CardBody className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--gradient-end)]/20">
                  <Radio className="h-5 w-5 text-[var(--gradient-start)]" weight="fill" />
                </span>
                <div>
                  <p className="text-sm font-semibold">연식 채널</p>
                  <p className="text-xs text-content-secondary">24시간 내 전달</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </AnimatedContent>
        <AnimatedContent direction="up" delay={0.1}>
          <Link href="/products/general">
            <Card className="transition hover:border-accent/50">
              <CardBody className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15">
                  <Package className="h-5 w-5 text-warning" weight="fill" />
                </span>
                <div>
                  <p className="text-sm font-semibold">일반 상품</p>
                  <p className="text-xs text-content-secondary">직접 전달</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </AnimatedContent>
      </section>

      <BannerSlot slot="HOME_FEED" />

      {/* Featured SMM */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">인기 SMM 상품</h2>
          <Link href="/products/smm" className="text-sm text-accent">
            전체보기
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {smm.map((p) => (
            <SmmCard key={p.id} p={p} />
          ))}
          {smm.length === 0 && (
            <p className="col-span-2 text-sm text-content-secondary">
              등록된 상품이 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* Featured channels */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">연식 채널</h2>
          <Link href="/products/channels" className="text-sm text-accent">
            전체보기
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {channels.map((c) => (
            <ChannelCard key={c.id} c={c} />
          ))}
          {channels.length === 0 && (
            <p className="col-span-2 text-sm text-content-secondary">
              등록된 채널이 없습니다.
            </p>
          )}
        </div>
      </section>

      <SocialProofToast />
    </div>
  );
}
