import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RamenDB - ラーメン評価プラットフォーム",
  description: "信頼できるレビューで見つける、あなたの一杯",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
