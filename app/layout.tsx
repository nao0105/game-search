import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLAYSCAPE — Find your next game",
  description: "ゲームの世界を探索して、次のお気に入りを見つけよう。RAWGのデータベースからゲームを検索できます。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
