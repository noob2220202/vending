// Centralized business + integration config. Reads env with sensible dev defaults.

export const config = {
  couponWindowMinutes: Number(process.env.COUPON_WINDOW_MINUTES ?? 60),
  chargeQuoteMinutes: Number(process.env.CHARGE_QUOTE_MINUTES ?? 30),

  // Roulette: visual segments shown on the wheel. Actual result is server-decided.
  rouletteSegments: ["꽝", "1000", "꽝", "5000", "꽝", "1000", "꽝", "50000"],
  // v1: always award the 50,000 segment (see spec 2.1).
  rouletteWinningSegment: "50000",
  rouletteCouponMaxBonus: 50000,

  smm: {
    apiUrl: process.env.SMM_API_URL ?? "",
    apiKey: process.env.SMM_API_KEY ?? "",
  },
  tron: {
    apiKey: process.env.TRONGRID_API_KEY ?? "",
    companyWallet: process.env.COMPANY_USDT_WALLET_ADDRESS ?? "",
    usdtContract:
      process.env.USDT_TRC20_CONTRACT_ADDRESS ??
      "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  },
  telegram: {
    loginBotToken: process.env.TELEGRAM_LOGIN_BOT_TOKEN ?? "",
    loginBotUsername: process.env.TELEGRAM_LOGIN_BOT_USERNAME ?? "",
    adminNotifyBotToken: process.env.ADMIN_NOTIFY_BOT_TOKEN ?? "",
    adminNotifyChatId: process.env.ADMIN_NOTIFY_CHAT_ID ?? "",
  },

  // 전자상거래법 표시 의무 정보 (footer + /legal/* 페이지). 실제 운영 전 .env에 채워넣을 것.
  company: {
    name: process.env.COMPANY_NAME ?? "(상호명 미입력)",
    representative: process.env.COMPANY_REPRESENTATIVE ?? "(대표자명 미입력)",
    registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER ?? "(사업자등록번호 미입력)",
    mailOrderNumber: process.env.COMPANY_MAIL_ORDER_NUMBER ?? "(통신판매업신고번호 미입력)",
    address: process.env.COMPANY_ADDRESS ?? "(사업장 주소 미입력)",
    email: process.env.COMPANY_EMAIL ?? "(고객센터 이메일 미입력)",
    phone: process.env.COMPANY_PHONE ?? "(고객센터 연락처 미입력)",
  },
} as const;
