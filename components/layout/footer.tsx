import Link from "next/link";
import { config } from "@/lib/config";

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "이용약관" },
  { href: "/legal/privacy", label: "개인정보처리방침" },
  { href: "/legal/refund", label: "환불정책" },
];

export function Footer() {
  const c = config.company;
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-32 pt-6 text-xs text-content-secondary">
      <div className="flex gap-3 border-t border-[var(--glass-border)] pt-4">
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-content-primary">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mt-3 space-y-0.5 leading-relaxed">
        <p>
          {c.name} · 대표 {c.representative} · 사업자등록번호 {c.registrationNumber}
        </p>
        <p>통신판매업신고번호 {c.mailOrderNumber}</p>
        <p>{c.address}</p>
        <p>
          고객센터 {c.email} · {c.phone}
        </p>
        <p className="pt-1 text-content-secondary/70">
          적립 포인트는 현금으로 환급되지 않으며, 본 사이트에서의 결제에만 사용할 수 있습니다.
        </p>
      </div>
    </footer>
  );
}
