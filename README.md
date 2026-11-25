# PLAYSCAPE

RAWG Video Games Database APIを使ったゲーム検索アプリです。Next.js App Routerで構築しています。

## はじめかた

1. [RAWG](https://rawg.io/apidocs) でAPIキーを取得します。
2. プロジェクトのルートに `.env.local` を作成し、APIキーを設定します。

```env
RAWG_API_KEY=your_rawg_api_key
```

3. 依存関係をインストールして開発サーバーを起動します。

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## 主な機能

- RAWGゲームデータベースの検索
- ジャンル・機種での絞り込み、並び替え、ページ切り替え
- ゲームの評価・発売日・対応機種などの詳細表示
- ブラウザーに保存するお気に入り
- APIキーをサーバー側に保持するAPIプロキシ

RAWG APIのレスポンスにはRAWGへのクレジット表記を含めています。RAWG APIの利用条件をご確認ください。
