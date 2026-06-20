import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { toSessionUser } from "@/lib/serialize";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";

// Self-hosted (not next/font/google) so production builds don't depend on
// reaching fonts.gstatic.com at build time.
const display = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  weight: "300 700",
  variable: "--font-display",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  weight: "400 700",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "펭구마켓 — 텔레그램 SMM & 연식채널",
  description:
    "텔레그램 멤버·조회수·리액션 SMM 패널과 연식 채널을 한 곳에서. 첫 가입 1시간 한정 매칭 적립.",
};

export const viewport: Viewport = {
  themeColor: "#0E1621",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const sessionUser = user ? toSessionUser(user) : null;

  return (
    <html lang="ko" className={cn(display.variable, mono.variable)}>
      <body>
        <Providers initialUser={sessionUser}>
          <Header />
          <main className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-3xl px-4 pb-28 pt-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
