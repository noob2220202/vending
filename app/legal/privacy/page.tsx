import { config } from "@/lib/config";

export const metadata = { title: "개인정보처리방침 — 펭구마켓" };

export default function PrivacyPage() {
  const c = config.company;
  return (
    <article className="space-y-6 py-2 text-sm leading-relaxed text-content-secondary">
      <h1 className="text-xl font-bold text-content-primary">개인정보처리방침</h1>

      <Section title="1. 수집하는 개인정보 항목">
        <ul className="ml-4 list-disc space-y-1">
          <li>회원가입: 아이디, 비밀번호(암호화 저장), USDT-TRC20 지갑주소</li>
          <li>텔레그램 로그인: 텔레그램 ID, 사용자명(선택)</li>
          <li>주문/결제: 주문 내역, 충전 트랜잭션 ID(TXID)</li>
          <li>자동 수집: 가입 시 IP 주소, 기기/브라우저 정보(User-Agent) — 부정가입 방지 목적</li>
        </ul>
      </Section>

      <Section title="2. 개인정보의 수집 및 이용 목적">
        <ul className="ml-4 list-disc space-y-1">
          <li>회원 식별 및 1인 1계정 원칙 적용을 위한 부정가입·중복적립 방지</li>
          <li>상품 주문 처리 및 SMM 패널/연식채널 인도</li>
          <li>USDT-TRC20 충전 확인(블록체인 조회 결과와의 대조)</li>
          <li>고객문의 응대 및 공지사항 전달</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        회원 탈퇴 시 즉시 파기하되, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령에서
        보존을 요구하는 거래 기록(계약 또는 청약철회, 대금결제, 재화 등의 공급기록 등)은 해당
        법령이 정한 기간 동안 보관합니다.
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 주문 처리를 위해
        필요한 최소한의 정보(예: SMM 패널 API에 전달되는 대상 URL/수량)는 서비스 제공 목적으로
        외부 패널사에 전달될 수 있습니다.
      </Section>

      <Section title="5. 이용자의 권리">
        이용자는 언제든지 본인의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를 통해 개인정보
        수집·이용에 대한 동의를 철회할 수 있습니다.
      </Section>

      <Section title="6. 개인정보 보호책임자">
        <p>
          {c.name} · 담당자: {c.representative} · 이메일: {c.email}
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1.5 text-base font-semibold text-content-primary">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
