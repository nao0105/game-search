"use client";

import { FormEvent, useState } from "react";

type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  platforms: { platform: { id: number; name: string } }[];
};

type SearchResponse = { results: Game[]; count: number; error?: string };

function formatDate(date: string | null) {
  if (!date) return "発売日未定";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("ja-JP").format(parsed);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchGames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) {
      setError("ゲーム名を入力してください。");
      setGames([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const response = await fetch(`/api/games?q=${encodeURIComponent(searchTerm)}`);
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) throw new Error(data.error ?? "検索に失敗しました。時間をおいて再度お試しください。");
      setGames(data.results ?? []);
    } catch (caught) {
      setGames([]);
      setError(caught instanceof Error ? caught.message : "予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <a className="brand" href="/" aria-label="Game Scout ホーム">
          <span className="brand-mark" aria-hidden="true">G</span> GAME SCOUT
        </a>
        <div className="hero-content">
          <p className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</p>
          <h1>次に遊ぶゲームを<br /><span>見つけよう。</span></h1>
          <p className="hero-copy">世界中のゲームデータベースから、気になるタイトルを検索。</p>
          <form className="search-form" onSubmit={searchGames}>
            <label className="visually-hidden" htmlFor="game-search">ゲーム名で検索</label>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              id="game-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ゲームタイトルを入力..."
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? "検索中..." : "検索する"}
            </button>
          </form>
          <p className="search-hint">例：The Legend of Zelda、Stardew Valley、Elden Ring</p>
        </div>
        <div className="hero-orb orb-one" aria-hidden="true" />
        <div className="hero-orb orb-two" aria-hidden="true" />
      </header>

      <section className="results-section" aria-live="polite">
        {loading ? (
          <div className="message-card"><span className="spinner" />ゲームを探しています...</div>
        ) : error ? (
          <div className="message-card error-message" role="alert">{error}</div>
        ) : games.length > 0 ? (
          <>
            <div className="section-heading">
              <div><p className="eyebrow">SEARCH RESULTS</p><h2>検索結果</h2></div>
              <span className="result-count">{games.length} 件</span>
            </div>
            <div className="game-grid">
              {games.map((game) => (
                <article className="game-card" key={game.id}>
                  <div className="game-image-wrap">
                    {game.background_image ? (
                      // RAWG provides remote image URLs; using img avoids requiring per-host config.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="game-image" src={game.background_image} alt={`${game.name}のゲーム画像`} loading="lazy" />
                    ) : <div className="image-placeholder">NO IMAGE</div>}
                    {game.metacritic !== null && <span className="metacritic">{game.metacritic}</span>}
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="game-date">{formatDate(game.released)}</p>
                    <div className="game-meta">
                      <span className="rating">★ {game.rating ? game.rating.toFixed(1) : "—"}</span>
                      <span>{game.ratings_count.toLocaleString("ja-JP")} ratings</span>
                    </div>
                    {game.platforms?.length > 0 && (
                      <p className="platforms">{game.platforms.slice(0, 3).map((item) => item.platform.name).join(" · ")}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : searched ? (
          <div className="message-card">一致するゲームが見つかりませんでした。別のキーワードでお試しください。</div>
        ) : (
          <div className="welcome-card">
            <span className="welcome-icon" aria-hidden="true">✦</span>
            <div><h2>ゲームの世界を探索しよう</h2><p>上の検索ボックスにゲーム名を入力して検索してください。</p></div>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span>GAME SCOUT</span>
        <span>ゲームデータ提供：<a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a></span>
      </footer>
    </main>
  );
}
