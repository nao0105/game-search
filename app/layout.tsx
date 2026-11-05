import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Game Scout — ゲームを見つけよう',
  description: 'RAWGのデータベースから、遊びたいゲームを検索できます。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
