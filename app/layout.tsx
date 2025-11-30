import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import DebugAuthLoader from "@/components/DebugAuthLoader";

export const metadata: Metadata = {
  title: {
    default: "RamenDB - ラーメン評価プラットフォーム",
    template: "%s | RamenDB",
  },
  description:
    "信頼できるレビューで見つける、あなたの一杯。家系、二郎系、つけ麺など、全国のラーメン店を5軸評価でレビュー。朝ラー対応、価格帯、駅近など、こだわり条件で検索できます。",
  keywords: [
    "ラーメン",
    "ラーメン店",
    "レビュー",
    "評価",
    "家系ラーメン",
    "二郎系",
    "つけ麺",
    "朝ラー",
    "ラーメンデータベース",
    "グルメ",
    "口コミ",
  ],
  authors: [{ name: "RamenDB" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ramen-db-three.vercel.app",
    siteName: "RamenDB",
    title: "RamenDB - ラーメン評価プラットフォーム",
    description:
      "信頼できるレビューで見つける、あなたの一杯。家系、二郎系、つけ麺など、全国のラーメン店を5軸評価でレビュー。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RamenDB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RamenDB - ラーメン評価プラットフォーム",
    description:
      "信頼できるレビューで見つける、あなたの一杯。家系、二郎系、つけ麺など、全国のラーメン店を5軸評価でレビュー。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "あとで設定",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <DebugAuthLoader />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
