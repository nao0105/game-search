'use client';

import { FormEvent, useState } from 'react';

type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  metacritic: number | null;
  genres: { id: number; name: string }[];
};

type SearchResponse = {
  results: Game[];
  next: string | null;
  error?: string;
};

export default function Home() {
  const [term, setTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(query: string, nextPage = 1) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/games?search=${encodeURIComponent(query)}&page=${nextPage}`);
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) throw new Error(data.error || '検索に失敗しました。');
      setGames((previous) => (nextPage === 1 ? data.results : [...previous, ...data.results]));
      setPage(nextPage);
      setHasMore(Boolean(data.next));
      setActiveQuery(query);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '通信に失敗しました。時間をおいて再度お試しください。');
      if (nextPage === 1) setGames([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    if (!query || loading) return;
    void search(query);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Game Scout ホーム"><span className="brand-mark">G</span> GAME SCOUT</a>
        <span className="topbar-note">あなたの次の一本を見つけよう</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-line" /> GAME DISCOVERY</p>
          <h1>次に遊ぶゲームを、<br /><span>ここで見つけよう。</span></h1>
          <p className="hero-copy">気になるタイトルを検索して、世界中のゲームと出会おう。</p>
          <form className="search-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="game-search">ゲーム名</label>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input id="game-search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="ゲームタイトルを入力..." maxLength={100} />
            <button type="submit" disabled={loading || !term.trim()}>{loading ? '検索中…' : '検索する'} <span aria-hidden="true">→</span></button>
          </form>
          <p className="search-hint">例：Elden Ring、Hollow Knight、Stardew Valley</p>
        </div>
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
        <div className="hero-decoration" aria-hidden="true">✳</div>
      </section>

      <section className="results-section" aria-live="polite">
        {error && <div className="notice error-notice"><span>!</span><div><strong>検索できませんでした</strong><p>{error}</p></div></div>}
        {games.length > 0 ? (
          <>
            <div className="section-heading"><div><p className="eyebrow">SEARCH RESULTS</p><h2>「{activeQuery}」の検索結果</h2></div><span className="result-count">{games.length} 件表示</span></div>
            <div className="game-grid">
              {games.map((game) => (
                <article className="game-card" key={game.id}>
                  <div className="game-image-wrap">
                    {game.background_image ? <img className="game-image" src={game.background_image} alt={`${game.name} のカバー画像`} loading="lazy" /> : <div className="image-placeholder">🎮</div>}
                    {game.metacritic !== null && <span className="metacritic">{game.metacritic}</span>}
                  </div>
                  <div className="game-info">
                    <div className="game-meta"><span>★ {game.rating ? game.rating.toFixed(1) : '評価なし'}</span><span>{game.released || '発売日未定'}</span></div>
                    <h3>{game.name}</h3>
                    {game.genres.length > 0 && <div className="genre-list">{game.genres.slice(0, 3).map((genre) => <span key={genre.id}>{genre.name}</span>)}</div>}
                  </div>
                </article>
              ))}
            </div>
            {hasMore && <div className="load-more-wrap"><button className="load-more" onClick={() => void search(activeQuery, page + 1)} disabled={loading}>{loading ? '読み込み中…' : 'もっと見る ↓'}</button></div>}
          </>
        ) : !loading && !error && activeQuery ? (
          <div className="empty-state"><span>⌕</span><h2>ゲームが見つかりませんでした</h2><p>別のキーワードで検索してみてください。</p></div>
        ) : !activeQuery && !loading && !error ? (
          <div className="welcome-state"><span className="welcome-icon">✦</span><p>検索窓に気になるゲームの名前を入力してください。</p></div>
        ) : null}
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark">G</span> GAME SCOUT</a><p>ゲームデータ提供：<a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a></p><span>Find your next adventure.</span></footer>
    </main>
  );
}
