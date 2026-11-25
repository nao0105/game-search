import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RAWG_API_KEY が設定されていません。" }, { status: 503 });
  }
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "無効なゲームIDです。" }, { status: 400 });

  try {
    const response = await fetch(`https://api.rawg.io/api/games/${id}?key=${encodeURIComponent(apiKey)}`, { next: { revalidate: 3600 } });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.detail ?? "詳細を取得できませんでした。" }, { status: response.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "詳細を取得できませんでした。" }, { status: 502 });
  }
}
