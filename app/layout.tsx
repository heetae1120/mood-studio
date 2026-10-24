import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "희태쇼핑몰도구모음",
  description: "쇼핑몰 이미지 편집·상세페이지·마진 계산·판매 수익기록",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
