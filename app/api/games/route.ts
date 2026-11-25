import { NextRequest, NextResponse } from "next/server";

type RawgGame = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  platforms: { platform: { id: number; name: string } }[];
};

type RawgResponse = { results?: RawgGame[]; count?: number };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "検索キーワードを入力してください。" }, { status: 400 });
  }
  if (query.length > 100) {
    return NextResponse.json({ error: "検索キーワードは100文字以内で入力してください。" }, { status: 400 });
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RAWG APIキーが設定されていません。.env.localにRAWG_API_KEYを設定してください。" },
      { status: 503 },
    );
  }

  const rawgUrl = new URL("https://api.rawg.io/api/games");
  rawgUrl.searchParams.set("key", apiKey);
  rawgUrl.searchParams.set("search", query);
  rawgUrl.searchParams.set("page_size", "20");
  rawgUrl.searchParams.set("search_precise", "false");

  try {
    const response = await fetch(rawgUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(`RAWG API returned status ${response.status}`);
      return NextResponse.json(
        { error: response.status === 401 || response.status === 403
          ? "RAWG APIキーを確認してください。"
          : "RAWG APIへの接続に失敗しました。時間をおいて再度お試しください。" },
        { status: response.status === 401 || response.status === 403 ? 502 : 502 },
      );
    }

    const data = (await response.json()) as RawgResponse;
    return NextResponse.json({ results: data.results ?? [], count: data.count ?? 0 });
  } catch (error) {
    console.error("RAWG request failed", error);
    return NextResponse.json({ error: "RAWG APIに接続できませんでした。時間をおいて再度お試しください。" }, { status: 502 });
  }
}
