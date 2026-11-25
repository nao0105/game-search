# Game Scout

RAWG APIを使ってゲームを検索できるNext.jsアプリです。検索語を入力すると、ゲーム画像、発売日、評価、対応プラットフォームなどを表示します。RAWG APIキーはサーバー側のAPI Routeで使用し、ブラウザーには公開しません。

## 必要なもの

- Node.js 20以上
- RAWG APIキー（[RAWG API](https://rawg.io/apidocs)から取得）

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local`を開き、取得したキーを設定してください。

```env
RAWG_API_KEY=取得したAPIキー
```

`.env.local`はGit管理対象外です。APIキーをソースコードやチャット、公開リポジトリに貼り付けないでください。

## 開発サーバー

```bash
npm run dev
```

ブラウザーで http://localhost:3000 を開きます。

## API

`GET /api/games?q=<検索語>` はRAWGのゲーム検索をサーバー側で呼び出し、最大20件を返します。キー未設定時は設定方法を案内するエラーを返します。

## ビルド

```bash
npm run lint
npm run build
```

デプロイ時はホスティングサービスの環境変数設定にも`RAWG_API_KEY`を登録してください。ゲームデータはRAWG提供です。
