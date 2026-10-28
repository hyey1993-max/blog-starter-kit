import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const serif = Noto_Serif_KR({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  preload: false,
});

export const metadata: Metadata = {
  title: "묵상 노트",
  description: "고민을 이어 적고, 펼친 말씀을 함께 읽는 개인 묵상 노트",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>{children}</body>
    </html>
  );
}
