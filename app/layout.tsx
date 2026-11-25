import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Scout | ゲーム検索",
  description: "RAWGのゲームデータベースからお気に入りのゲームを見つけよう。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
