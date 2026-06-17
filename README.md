# 티지마켓 — 텔레그램 SMM 패널 & 연식채널 마켓플레이스

텔레그램 생태계용 디지털 상품 판매 사이트. 두 가지 상품군을 하나의 쇼핑 경험으로 묶습니다.

- **SMM 패널 상품** — 텔레그램 멤버/조회수/리액션/부스트 등을 외부 SMM 패널 API로 자동 처리
- **연식 채널** — 운영자가 결제 후 24시간 내 수동으로 소유권 이전
- **그로스 장치** — 가입 1시간 한정 룰렛 → 구매액 100% 매칭 적립(최대 50,000P)

모바일 퍼스트, 다크 글래스모피즘 UI. 추후 텔레그램 미니앱 포팅을 염두에 둔 설계(모든 색상 CSS 변수, 하단 단일 CTA 분리 등).

## 기술 스택

- **Next.js 14 (App Router) + TypeScript** — 프론트 + API Routes
- **Tailwind CSS** — 디자인 토큰은 CSS 변수로 관리 (`--tg-theme-*` 매핑 대비)
- **PostgreSQL + Prisma**
- **jose** (JWT 세션) · **bcryptjs** (비밀번호) · **zod** (검증)
- **framer-motion** · **lucide-react** · Pretendard

## 로컬 실행

```bash
# 1) 의존성
npm install

# 2) 환경변수
cp .env.example .env   # DATABASE_URL, JWT_SECRET 등 채우기

# 3) DB 마이그레이션 + 시드
npx prisma migrate dev
npm run seed

# 4) 개발 서버
npm run dev            # http://localhost:3000
```

관리자 데모 계정: `admin` / `admin1234`

## 프로젝트 구조

```
app/                  App Router 페이지 + /api 라우트
  api/auth/*          회원가입·로그인·텔레그램 로그인·세션
  api/orders          주문 생성(잔액 차감·쿠폰 매칭) / 조회
  api/charge/mock     Phase 1 모의 충전 (Phase 3에서 USDT 대체)
  api/coupons/active  활성 쿠폰 조회 (헤더 카운트다운)
components/           UI 프리미티브 · 레이아웃 · 상품 카드/패널
lib/                  prisma, auth, telegram-auth, validation, orders(쿠폰매칭),
                      notify(관리자 텔레그램), config, utils
store/cart.ts         장바구니 (zustand, localStorage)
prisma/               schema.prisma · seed.ts
```

## 핵심 비즈니스 로직 (서버에서 확정)

- **가격/금액**은 항상 서버가 DB 기준으로 재계산 (클라이언트 값 신뢰 안 함)
- **쿠폰 매칭 적립**: 주문 트랜잭션 내에서 활성 쿠폰 확인 → `PERCENT_MATCH`면
  `min(구매액 × value%, maxBonus)`를 포인트로 적립, 쿠폰 `USED` 처리
  (`lib/orders.ts` → `applyCouponMatch`)
- **연식채널 재고**는 트랜잭션 내 `updateMany(status: AVAILABLE → PROCESSING)`로
  원자적 선점 (동시구매 방지)
- **적립 포인트는 출금 불가** (현금화 경로 미제공 → 어뷰징 방지)
- **어뷰징 방지**: `walletAddress`/`username`/`telegramId` 유니크, `RouletteSpin`
  userId 유니크(1인 1회), 가입 시 `SignupLog`(IP/UA) 수집

## 개발 단계 (Phase)

- [x] **Phase 1** — 인증(ID/PW + 지갑주소, 텔레그램 로그인 위젯) · 상품목록/상세
  (SMM·채널) · 장바구니 · 결제(잔액 차감) · 모의 충전 · 마이페이지/주문내역.
  주문 시 쿠폰 매칭 적립 로직 포함(쿠폰 생성은 Phase 2).
- [ ] **Phase 2** — 룰렛 이벤트(서버 결과 확정) · 쿠폰함/카운트다운 · 포인트 사용
- [ ] **Phase 3** — 실제 SMM API 연동 · USDT-TRC20 충전(자동매칭 + TXID 백업) · 관리자
- [ ] **Phase 4** — 텔레그램 미니앱 포팅

> Phase 1의 `/api/charge/mock`과 `/roulette` 플레이스홀더는 이후 단계에서 실제
> 구현으로 대체됩니다.
