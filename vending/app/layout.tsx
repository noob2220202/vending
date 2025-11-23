import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import LayoutWrapper from "@/app/layout-wrapper";
import { EmergencyAnnouncement } from "@/components/emergency-announcement";
import { ChargeNotification } from "@/components/charge-notification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "핵스팟",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Navbar />
          <EmergencyAnnouncement />
          <ChargeNotification />
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
