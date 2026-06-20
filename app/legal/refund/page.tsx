import { config } from "@/lib/config";

export const metadata = { title: "환불정책 — 펭구마켓" };

export default function RefundPage() {
  const c = config.company;
  return (
    <article className="space-y-6 py-2 text-sm leading-relaxed text-content-secondary">
      <h1 className="text-xl font-bold text-content-primary">환불정책</h1>

      <Section title="1. SMM 패널 상품">
        외부 패널 API로 처리가 시작된 이후에는 작업 진행 상황에 따라 환불이 제한될 수 있습니다.
        처리가 시작되기 전 취소를 요청한 경우, 충전 잔액(지갑 잔액)으로 전액 환불됩니다. 단,
        매칭 적립으로 지급된 포인트는 환불 대상에서 제외되며 회수될 수 있습니다.
      </Section>

      <Section title="2. 연식 채널">
        결제 후 24시간 이내에 운영자가 소유권 이전을 완료하지 못하는 경우, 구매자는 전액 환불을
        요청할 수 있습니다. 소유권 이전이 완료된 이후에는 채널 자체의 특성(계정 인수인계)상
        환불이 제한됩니다.
      </Section>

      <Section title="3. 일반 상품">
        운영자가 직접 전달하는 상품으로, 전달 전 취소 요청 시 전액 환불됩니다. 전달 완료 후에는
        상품 하자 등 정당한 사유가 있는 경우에 한해 고객센터를 통해 환불을 접수합니다.
      </Section>

      <Section title="4. 환불 수단">
        환불은 원칙적으로 지갑 잔액(충전금)으로 지급됩니다. 적립 포인트(매칭 적립 등)는
        비현금성 자산으로, 환불 대상이 아니며 현금으로 전환되지 않습니다.
      </Section>

      <Section title="5. 환불 신청 방법">
        마이페이지 &gt; 주문내역에서 해당 주문을 선택해 환불을 요청하거나, 고객센터(
        {c.email} / {c.phone})로 문의해주세요. 관리자 확인 후 처리됩니다.
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
