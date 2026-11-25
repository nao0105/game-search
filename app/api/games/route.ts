import { NextRequest, NextResponse } from "next/server";

const RAWG_API = "https://api.rawg.io/api";

export async function GET(request: NextRequest) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RAWG_API_KEY が設定されていません。.env.local にAPIキーを追加してください。" }, { status: 503 });
  }

  const incoming = request.nextUrl.searchParams;
  const params = new URLSearchParams({ key: apiKey, page_size: "21" });
  for (const key of ["search", "page", "ordering", "genres", "platforms"]) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }

  try {
    const response = await fetch(`${RAWG_API}/games?${params.toString()}`, { next: { revalidate: 300 } });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.detail ?? "RAWG APIからデータを取得できませんでした。" }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "RAWG APIに接続できませんでした。時間をおいて再度お試しください。" }, { status: 502 });
  }
}
