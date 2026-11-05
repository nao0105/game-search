# Game Scout

RAWG APIを利用したゲーム検索ウェブアプリです。Next.js App Routerで構築しています。

## はじめかた

1. [RAWG API](https://rawg.io/apidocs) でAPIキーを取得します。
2. `.env.example` を `.env.local` にコピーし、取得したキーを設定します。

```env
RAWG_API_KEY=取得したAPIキー
```

3. Node.jsをインストールし、依存関係を入れて開発サーバーを起動します。

```bash
npm install
npm run dev
```

ブラウザーで http://localhost:3000 を開いてください。

APIキーはサーバー側の `/api/games` からのみ利用するため、フロントエンドのコードには含まれません。`.env.local` はGitにコミットしないでください。デプロイ時はホスティングサービスの環境変数に `RAWG_API_KEY` を設定してください。

## 機能

- RAWGゲームデータベースのタイトル検索
- 評価、発売日、ジャンル、Metacriticスコアの表示
- 追加結果の読み込み
- RAWG APIキー未設定時やAPIエラー時の案内
- RAWGのデータおよび画像を利用しているページにRAWGへのリンクを表示

RAWGのAPIおよび利用条件については[公式ドキュメント](https://rawg.io/apidocs)を確認してください。
