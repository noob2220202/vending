import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin account (login: admin / admin1234)
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { role: "ADMIN" },
    create: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin1234", 10),
      walletAddress: "TXAdminSeedWalletAddrxxxxxxxxxxxxx1",
      role: "ADMIN",
    },
  });

  const smm = [
    {
      platform: "TELEGRAM",
      category: "MEMBERS",
      name: "텔레그램 채널 멤버 (실제 유저)",
      pricePerThousand: 12000,
      minQty: 100,
      maxQty: 100000,
      speedLabel: "즉시 시작",
      externalServiceId: "1001",
    },
    {
      platform: "TELEGRAM",
      category: "MEMBERS",
      name: "텔레그램 그룹 멤버 (Non-drop)",
      pricePerThousand: 15000,
      minQty: 100,
      maxQty: 50000,
      speedLabel: "1~24시간",
      externalServiceId: "1002",
    },
    {
      platform: "TELEGRAM",
      category: "VIEWS",
      name: "텔레그램 게시물 조회수",
      pricePerThousand: 800,
      minQty: 1000,
      maxQty: 1000000,
      speedLabel: "즉시",
      externalServiceId: "2001",
    },
    {
      platform: "TELEGRAM",
      category: "VIEWS",
      name: "최근 5개 게시물 조회수",
      pricePerThousand: 2500,
      minQty: 500,
      maxQty: 500000,
      speedLabel: "즉시",
      externalServiceId: "2002",
    },
    {
      platform: "TELEGRAM",
      category: "REACTIONS",
      name: "긍정 리액션 (👍❤️🔥)",
      pricePerThousand: 3000,
      minQty: 50,
      maxQty: 50000,
      speedLabel: "빠름",
      externalServiceId: "3001",
    },
    {
      platform: "TELEGRAM",
      category: "BOOST",
      name: "프리미엄 채널 부스트",
      pricePerThousand: 45000,
      minQty: 1,
      maxQty: 100,
      speedLabel: "1~6시간",
      externalServiceId: "4001",
    },
  ];

  // Reset demo catalog so re-seeding is clean.
  await prisma.smmProduct.deleteMany({});
  await prisma.smmProduct.createMany({ data: smm });

  const channels = [
    {
      title: "암호화폐 뉴스 채널",
      category: "금융/코인",
      establishedYear: 2019,
      subscriberCount: 12400,
      price: 850000,
      description: "2019년 개설된 코인 뉴스 채널. 활성 구독자 다수.",
    },
    {
      title: "IT/개발 정보 공유방",
      category: "테크",
      establishedYear: 2020,
      subscriberCount: 8600,
      price: 520000,
      description: "개발자 대상 정보 공유 채널. 꾸준한 유입.",
    },
    {
      title: "해외축구 중계/정보",
      category: "스포츠",
      establishedYear: 2021,
      subscriberCount: 23100,
      price: 1200000,
      description: "스포츠 팬덤이 강한 대형 채널.",
    },
    {
      title: "K-패션 정보 채널",
      category: "라이프스타일",
      establishedYear: 2022,
      subscriberCount: 5400,
      price: 290000,
      description: "여성 타깃 패션 정보 채널.",
    },
  ];

  await prisma.channelListing.deleteMany({});
  await prisma.channelListing.createMany({ data: channels });

  console.log("Seed complete: admin + %d SMM + %d channels", smm.length, channels.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
