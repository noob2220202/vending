import { config } from "@/lib/config";

export const metadata = { title: "이용약관 — 펭구마켓" };

export default function TermsPage() {
  const c = config.company;
  return (
    <article className="space-y-6 py-2 text-sm leading-relaxed text-content-secondary">
      <h1 className="text-xl font-bold text-content-primary">이용약관</h1>

      <Section title="제1조 (목적)">
        본 약관은 {c.name}(이하 &ldquo;회사&rdquo;)가 운영하는 펭구마켓(이하 &ldquo;서비스&rdquo;)의
        이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </Section>

      <Section title="제2조 (서비스의 내용)">
        회사는 다음 각 호의 상품을 판매합니다.
        <ol className="ml-4 mt-2 list-decimal space-y-1">
          <li>SMM 패널 상품 — 외부 API를 통해 자동으로 처리되는 디지털 마케팅 상품</li>
          <li>연식 채널 — 운영자가 결제 확인 후 수동으로 소유권을 이전하는 상품</li>
          <li>일반 상품 — 운영자가 결제 확인 후 직접 전달하는 상품</li>
        </ol>
      </Section>

      <Section title="제3조 (회원가입 및 계정)">
        이용자는 1인 1계정 원칙에 따라 가입하며, 지갑주소·텔레그램 계정 등 식별정보는 중복 가입
        방지를 위해 계정당 1회만 사용할 수 있습니다. 허위 정보로 가입하거나 동일인이 다수 계정을
        생성하는 경우 서비스 이용이 제한될 수 있습니다.
      </Section>

      <Section title="제4조 (포인트 적립 및 사용)">
        가입 1시간 한정 룰렛 이벤트 등으로 적립되는 포인트는 본 서비스 내 결제에만 사용할 수 있는
        비현금성 자산이며, 현금으로 환급되지 않습니다. 포인트의 적립 결과 및 적립액은 서버에서
        확정되며, 부정한 방법(다중계정, 자동화 도구 등)으로 적립된 포인트는 회사가 임의로 회수할
        수 있습니다.
      </Section>

      <Section title="제5조 (주문 및 결제)">
        모든 주문의 금액과 재고는 결제 시점에 서버에서 재확인되며, 클라이언트가 전송한 값은
        참고용으로만 사용됩니다. 연식채널 등 한정 재고 상품은 동시 구매 시 선착순으로 처리됩니다.
      </Section>

      <Section title="제6조 (서비스 이용제한)">
        회사는 이용자가 본 약관 또는 관계 법령을 위반한 경우, 사전 통지 없이 서비스 이용을
        제한하거나 계약을 해지할 수 있습니다.
      </Section>

      <Section title="제7조 (면책)">
        회사는 천재지변, 불가항력, 이용자의 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.
        외부 SMM 패널 API의 장애로 인한 처리 지연에 대해서도 회사는 최선을 다해 조치하나, 그
        결과를 보증하지 않습니다.
      </Section>

      <Section title="제8조 (약관의 변경)">
        본 약관은 관계 법령에 위배되지 않는 범위에서 개정될 수 있으며, 개정 시 서비스 내 공지를
        통해 안내합니다.
      </Section>

      <p className="pt-2 text-xs text-content-secondary/70">
        문의: {c.email} · {c.phone}
      </p>
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
