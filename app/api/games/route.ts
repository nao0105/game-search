import { NextRequest, NextResponse } from 'next/server';

type RawgGame = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  metacritic: number | null;
  genres: { id: number; name: string }[];
};

type RawgResponse = { results: RawgGame[]; next: string | null };

export async function GET(request: NextRequest) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RAWG_API_KEY が設定されていません。.env.local にAPIキーを設定してください。' }, { status: 503 });
  }

  const search = request.nextUrl.searchParams.get('search')?.trim();
  if (!search) return NextResponse.json({ error: 'ゲーム名を入力してください。' }, { status: 400 });
  if (search.length > 100) return NextResponse.json({ error: '検索語は100文字以内で入力してください。' }, { status: 400 });

  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100) : 1;
  const params = new URLSearchParams({ key: apiKey, search, page: String(page), page_size: '20' });

  try {
    const response = await fetch(`https://api.rawg.io/api/games?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ error: response.status === 401 || response.status === 403 ? 'RAWG APIキーを確認してください。' : 'RAWG APIからデータを取得できませんでした。時間をおいて再度お試しください。' }, { status: 502 });
    }
    const data = (await response.json()) as RawgResponse;
    return NextResponse.json({ results: data.results ?? [], next: data.next ?? null });
  } catch {
    return NextResponse.json({ error: 'RAWG APIに接続できませんでした。ネットワークを確認してください。' }, { status: 502 });
  }
}
