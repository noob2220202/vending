# 펭구마켓 — 텔레그램 SMM 패널 & 연식채널 마켓플레이스

텔레그램 생태계용 디지털 상품 판매 사이트. 세 가지 상품군을 하나의 쇼핑 경험으로 묶습니다.

- **SMM 패널 상품** — 텔레그램 멤버/조회수/리액션/부스트 등을 외부 SMM 패널 API로 자동 처리
- **연식 채널** — 운영자가 결제 후 24시간 내 수동으로 소유권 이전
- **일반 상품** — 운영자가 결제 후 직접 전달하는 재고형 상품
- **그로스 장치** — 가입 1시간 한정 룰렛(서버 결과 확정) → 구매액 100% 매칭 적립(최대 50,000P)

모바일 퍼스트, 다크 글래스모피즘 UI. 추후 텔레그램 미니앱 포팅을 염두에 둔 설계(모든 색상
CSS 변수, 하단 단일 CTA 컴포넌트 분리, 다이렉트 콜아웃 의존 최소화).

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 14 (App Router) + TypeScript — 프론트 + API Routes |
| 스타일 | Tailwind CSS, 디자인 토큰은 CSS 변수로 관리 (`--tg-theme-*` 매핑 대비) |
| DB | SQLite + Prisma (파일 기반, 별도 DB 서버 불필요) |
| 인증 | `jose`(JWT 세션) · `bcryptjs`(비밀번호) · 텔레그램 로그인 위젯(HMAC 검증) |
| 검증 | `zod` |
| 모션/이펙트 | `framer-motion` · `canvas-confetti` · react-bits 스타일 커스텀 컴포넌트 |
| 아이콘 | `@phosphor-icons/react` (weight: `fill`/`bold`/`duotone` 용도별 구분) |
| 폰트 | Pretendard(본문/한글) + Space Grotesk(디스플레이) + JetBrains Mono(숫자/tnum), 후자 둘은 자체 호스팅(`next/font/local`) |
| 외부 연동 | SMM 패널 API(어댑터 패턴) · TRON(TronGrid, USDT-TRC20 입금 조회) · 텔레그램 Bot API(로그인/관리자 알림) |

## 디자인 시스템 요약

- **색상**: `--bg-base`/`--bg-elevated`/`--bg-card`(다크 배경 계층), `--accent`(텔레그램 블루),
  `--success`/`--warning`/`--danger`(상태), `--glass-bg`/`--glass-border`(글래스모피즘) — 전부
  `app/globals.css`의 CSS 변수. 텔레그램 미니앱 포팅 시 `--tg-theme-*` 값으로 1:1 매핑 가능하도록
  하드코딩 색상 금지.
- **타이포그래피**: 한글/본문은 Pretendard, 숫자·영문 헤드라인은 Space Grotesk(`font-display`),
  가격/수량 등 tabular 숫자는 JetBrains Mono(`.tnum`, `font-mono`).
- **아이콘**: Phosphor Icons. 강조 액션은 `weight="fill"`, 보조 액션/네비게이션은 `weight="bold"`.
- **컴포넌트**: `components/bits/*`에 react-bits 스타일 장식 컴포넌트(`Particles`, `SplitText`,
  `ClickSpark`) 분리, `components/ui/*`에 범용 프리미티브(`Button`, `Card`, `Badge`, `Input`,
  `Select`, `Countdown`). 카드/모달은 `glass-card noise-overlay` 클래스로 노이즈 텍스처 +
  글래스모피즘 일관 적용.

## 사이트맵

```
/                          홈 — 상품 하이라이트 + 배너 슬롯(향후 광고 시스템 대비)
/auth/login, /auth/register   ID/PW + 지갑주소 가입, 텔레그램 로그인 위젯
/products/smm[, /[id]]        SMM 패널 상품 목록/상세 (카테고리 필터)
/products/channels[, /[id]]   연식 채널 목록/상세
/products/general[, /[id]]    일반 상품 목록/상세
/roulette                     가입 1시간 한정 룰렛 (서버 결과 확정)
/cart, /checkout               장바구니 → 결제(잔액 차감 + 쿠폰 매칭 적립)
/mypage[, /charge, /orders/[id]] 지갑/포인트, USDT 충전, 주문상세
/legal/terms, /privacy, /refund  이용약관 · 개인정보처리방침 · 환불정책
/admin[, /charges, /products, /channels, /orders]  관리자 대시보드(ADMIN 전용)
```

## 로컬 실행

```bash
# 1) 의존성
npm install

# 2) 환경변수
cp .env.example .env   # 아래 "환경변수 체크리스트" 참고

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
  api/roulette[/spin] 룰렛 참여여부 조회 / 스핀(결과는 항상 서버에서 확정)
  api/orders          주문 생성(잔액 차감·쿠폰 매칭) / 조회
  api/charge/*        USDT-TRC20 견적(quote) · TXID 직접제출(submit-txid) · 모의충전(mock, 데모용)
  api/coupons/active  활성 쿠폰 조회 (헤더 카운트다운)
  api/admin/*         관리자 전용: 충전승인, SMM/일반상품 CRUD, 채널 CRUD, 주문처리
  legal/*             이용약관 · 개인정보처리방침 · 환불정책
components/           UI 프리미티브 · 레이아웃(헤더/푸터) · 상품 카드/패널 · 룰렛 휠
lib/                  prisma, auth, telegram-auth, validation, orders(쿠폰매칭), tron(체인조회),
                      notify(관리자 텔레그램), audit(처리내역 로그), config, utils
store/cart.ts         장바구니 (zustand, localStorage)
scripts/poll-charges.ts  USDT 입금 자동매칭 크론 워커 (Next.js 서버와 독립 실행)
prisma/               schema.prisma · seed.ts · migrations/
```

## 핵심 비즈니스 로직 (서버에서 확정)

- **가격/금액**은 항상 서버가 DB 기준으로 재계산 (클라이언트 값 신뢰 안 함)
- **룰렛 결과**는 클라이언트 입력을 받지 않고 서버가 단독으로 결정(`POST /api/roulette/spin`은
  바디가 없음). 1인 1회는 `RouletteSpin.userId` 유니크 제약 + 사전조회로 보장, 동시요청은
  `P2002` 충돌을 잡아 동일하게 처리(레이스 안전)
- **쿠폰 매칭 적립**: 주문 트랜잭션 내에서 활성 쿠폰 확인 → `PERCENT_MATCH`면
  `min(구매액 × value%, maxBonus)`를 포인트로 적립, 쿠폰 `USED` 처리
  (`lib/orders.ts` → `applyCouponMatch`)
- **USDT-TRC20 충전 확인은 블록체인 조회 결과만 신뢰**: 발신주소 매칭 자동확인(`poll-charges`
  크론) 또는 이용자가 직접 제출한 TXID 조회(`submit-txid`) — 둘 다 TronGrid 조회 결과와
  대조 후에만 잔액을 증액. `matchedTxId`는 유니크 제약으로 동일 트랜잭션 중복적립 방지
- **연식채널 재고**는 트랜잭션 내 `updateMany(status: AVAILABLE → PROCESSING)`로
  원자적 선점 (동시구매 방지)
- **적립 포인트는 출금 불가** (현금화 경로 미제공 → 어뷰징 방지)
- **어뷰징 방지**: `walletAddress`/`username`/`telegramId` 유니크, `RouletteSpin.userId`
  유니크(1인 1회), 가입 시 `SignupLog`(IP/UA) 수집
- **처리내역 감사로그**: 충전 승인/거절, 주문 완료/취소, 관리자의 상품·채널 등록/수정은 모두
  `AuditLog`에 actor/action/target을 기록 (`lib/audit.ts` → `logAudit`)

## 환경변수 체크리스트

`.env.example` 전체 목록 중 운영 전 반드시 채워야 하는 항목:

| 변수 | 용도 |
| --- | --- |
| `DATABASE_URL`, `JWT_SECRET` | 필수 — 없으면 기동 자체가 안 됨 |
| `SMM_API_URL`, `SMM_API_KEY` | 실제 SMM 패널 연동 (서버 전용, 클라이언트 노출 금지) |
| `TRONGRID_API_KEY`, `COMPANY_USDT_WALLET_ADDRESS` | USDT-TRC20 입금 확인/수금 지갑 |
| `TELEGRAM_LOGIN_BOT_TOKEN/USERNAME`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | 텔레그램 로그인 위젯 |
| `ADMIN_NOTIFY_BOT_TOKEN`, `ADMIN_NOTIFY_CHAT_ID` | 충전/주문 발생 시 관리자 텔레그램 알림 |
| `COMPANY_NAME`, `COMPANY_REPRESENTATIVE`, `COMPANY_REGISTRATION_NUMBER`, `COMPANY_MAIL_ORDER_NUMBER`, `COMPANY_ADDRESS`, `COMPANY_EMAIL`, `COMPANY_PHONE` | 전자상거래법 표시 의무 — 푸터/약관 페이지에 노출 |

## 운영 — USDT 자동충전 크론

`scripts/poll-charges.ts`는 Next.js 서버와 별도로 주기 실행해야 하는 워커입니다. 대기중인
충전요청을 TronGrid로 조회한 최근 입금 내역과 대조해 발신주소가 일치하면 자동으로 확정합니다.
Next.js 서버에는 내장 스케줄러가 없으므로, 배포 환경에서 별도로 등록해야 합니다.

```bash
# 1분마다 실행 (VPS crontab -e 에 추가)
* * * * * cd /path/to/vending && /usr/bin/npm run poll-charges >> /var/log/poll-charges.log 2>&1
```

systemd timer를 선호한다면 `npm run poll-charges`를 실행하는 oneshot 서비스 + 1분 주기 타이머로
등록해도 동일하게 동작합니다. 스크립트는 매 실행마다 `.env`를 직접 파싱하고 자체
`PrismaClient`를 열고 닫으므로, Next.js 서버 프로세스와 독립적으로 동작합니다.

## 개발 단계 (Phase)

- [x] **Phase 1** — 인증(ID/PW + 지갑주소, 텔레그램 로그인 위젯) · 상품목록/상세
  (SMM·채널·일반) · 장바구니 · 결제(잔액 차감) · 마이페이지/주문내역
- [x] **Phase 2** — 룰렛 이벤트(서버 결과 확정) · 쿠폰함/카운트다운 · 주문 시 쿠폰 매칭 적립
- [x] **Phase 3** — 실제 SMM API 연동 · USDT-TRC20 충전(자동매칭 + TXID 백업) · 관리자
  패널(충전승인/상품·채널 CRUD/주문처리) · 감사로그 · 법적 고지 페이지
- [ ] **Phase 4** — 텔레그램 미니앱 포팅 · 멀티벤더(`Vendor`/`VendorApplication`) ·
  광고 배너(`Advertiser`/`AdBanner`) — 스키마는 이미 마련되어 있으나 UI/API 미연동
