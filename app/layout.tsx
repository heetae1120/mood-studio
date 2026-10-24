import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOOD Studio",
  description: "셀러를 위한 포즈·장소 이미지 편집 스튜디오",
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
