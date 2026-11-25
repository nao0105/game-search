"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Genre = { id: number; name: string; slug: string };
type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  genres: Genre[];
  platforms: { platform: { name: string } }[];
};
type GameDetail = Game & { description_raw?: string; website?: string; developers?: { name: string }[]; publishers?: { name: string }[] };
type GameResponse = { count: number; next: string | null; results: Game[] };

const GENRES = [
  { label: "すべて", slug: "" }, { label: "アクション", slug: "action" }, { label: "RPG", slug: "role-playing-games-rpg" },
  { label: "アドベンチャー", slug: "adventure" }, { label: "シューティング", slug: "shooter" }, { label: "パズル", slug: "puzzle" },
  { label: "インディー", slug: "indie" }, { label: "ストラテジー", slug: "strategy" }
];
const PLATFORMS = [
  { label: "すべての機種", id: "" }, { label: "PC", id: "4" }, { label: "PlayStation", id: "18" },
  { label: "Xbox", id: "1" }, { label: "Nintendo", id: "7" }
];
const SORTS = [
  { label: "人気順", value: "-added" }, { label: "評価が高い順", value: "-rating" },
  { label: "発売日が新しい順", value: "-released" }, { label: "名前順", value: "name" }
];

function formatDate(value: string | null) {
  if (!value) return "発売日未定";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default function GameSearch() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("-added");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<GameDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem("playscape-favorites") ?? "[]")); } catch { setFavorites([]); }
  }, []);

  const loadGames = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), ordering: sort });
    if (search) params.set("search", search);
    if (genre) params.set("genres", genre);
    if (platform) params.set("platforms", platform);
    try {
      const response = await fetch(`/api/games?${params}`, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "ゲームの読み込みに失敗しました。");
      setData(result);
    } catch (reason) {
      if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, sort, search, genre, platform]);

  useEffect(() => { void loadGames(); return () => abortRef.current?.abort(); }, [loadGames]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [selected]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  async function showDetails(game: Game) {
    setSelected(game);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/games/${game.id}`);
      const result = await response.json();
      if (response.ok) setSelected(result);
    } catch { /* The summary card remains available if details fail. */ }
    finally { setDetailLoading(false); }
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("playscape-favorites", JSON.stringify(next));
      return next;
    });
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PLAYSCAPE ホーム"><span className="brand-mark">P</span><span>PLAY<span className="brand-accent">SCAPE</span></span></a>
        <div className="topbar-right"><span className="live-dot" /> GAME DISCOVERY <span className="topbar-divider">/</span> どんなゲームに出会う？</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-inner">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT ADVENTURE STARTS HERE</div>
          <h1>まだ知らない<br /><span>お気に入り</span>に出会おう。</h1>
          <p className="hero-copy">世界中のゲームから、次に夢中になれる一本を。</p>
          <form className="search-box" onSubmit={submitSearch}>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input aria-label="ゲームを検索" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ゲームタイトルを入力..." />
            {query && <button className="clear-search" type="button" aria-label="検索をクリア" onClick={() => { setQuery(""); setSearch(""); setPage(1); }}>×</button>}
            <button className="search-button" type="submit">探す <span aria-hidden="true">↗</span></button>
          </form>
          <div className="hero-note"><span>↳</span> タイトル・ジャンルから検索できます</div>
        </div>
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="hero-index">DISCOVER / 001</div>
      </section>

      <section className="catalog" aria-label="ゲームカタログ">
        <div className="catalog-heading">
          <div><div className="section-kicker">CURATED FOR YOU <span>✳</span></div><h2>{search ? `「${search}」の検索結果` : "ゲームを探索する"}</h2></div>
          <p>世界中のゲームから<br className="desktop-break" />あなたにぴったりの一本を。</p>
        </div>

        <div className="filter-area">
          <div className="genre-row" role="group" aria-label="ジャンルで絞り込む">
            {GENRES.map((item) => <button key={item.slug || "all"} onClick={() => updateFilter(setGenre, item.slug)} className={`genre-chip ${genre === item.slug ? "active" : ""}`} aria-pressed={genre === item.slug}>{item.label}</button>)}
          </div>
          <div className="filter-bottom">
            <label className="platform-select"><span>機種</span><select aria-label="機種で絞り込む" value={platform} onChange={(event) => updateFilter(setPlatform, event.target.value)}>{PLATFORMS.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select><span className="select-arrow">⌄</span></label>
            <div className="results-count">{loading ? <><span className="tiny-spinner" /> 読み込み中...</> : <><b>{(data?.count ?? 0).toLocaleString("ja-JP")}</b> 件のゲーム</>}</div>
            <label className="sort-select"><span>並び替え</span><select aria-label="並び替え" value={sort} onChange={(event) => updateFilter(setSort, event.target.value)}>{SORTS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><span className="select-arrow">⌄</span></label>
          </div>
        </div>

        {error ? <div className="error-panel"><span className="error-symbol">!</span><div><h3>ゲームを読み込めませんでした</h3><p>{error}</p>{error.includes("RAWG_API_KEY") && <p className="error-help">プロジェクトのルートに <code>.env.local</code> を作り、<code>RAWG_API_KEY=あなたのAPIキー</code> を設定してください。</p>}<button className="retry-button" onClick={() => void loadGames()}>もう一度試す ↗</button></div></div>
        : loading && !data ? <div className="game-grid">{Array.from({ length: 9 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-image" /><div className="skeleton-lines"><i /><i /><i /></div></div>)}</div>
        : data?.results.length ? <div className="game-grid" aria-live="polite">{data.results.map((game, index) => <article className="game-card" key={game.id} style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}>
          <button className="card-open" onClick={() => void showDetails(game)} aria-label={`${game.name}の詳細を見る`}>
            <div className="game-image-wrap">{game.background_image ? <img className="game-image" src={game.background_image} alt="" loading={index < 6 ? "eager" : "lazy"} /> : <div className="image-placeholder">✳</div>}<div className="image-overlay" /><span className="rating-badge"><span>★</span> {game.rating ? game.rating.toFixed(1) : "—"}</span><span className="card-arrow">↗</span></div>
            <div className="game-info"><div className="game-genres">{game.genres?.slice(0, 2).map((item) => <span key={item.id}>{item.name}</span>)}</div><h3>{game.name}</h3><div className="game-meta"><span>{formatDate(game.released)}</span>{game.metacritic ? <span className="metacritic">MC {game.metacritic}</span> : null}</div></div>
          </button>
          <button className={`favorite-button ${favorites.includes(game.id) ? "is-favorite" : ""}`} onClick={() => toggleFavorite(game.id)} aria-label={favorites.includes(game.id) ? `${game.name}をお気に入りから削除` : `${game.name}をお気に入りに追加`} aria-pressed={favorites.includes(game.id)}>{favorites.includes(game.id) ? "♥" : "♡"}</button>
        </article>)}</div> : <div className="empty-state"><span>⌕</span><h3>ゲームが見つかりませんでした</h3><p>別のキーワードやジャンルで検索してみてください。</p><button onClick={() => { setQuery(""); setSearch(""); setGenre(""); setPlatform(""); setPage(1); }}>フィルターをリセット ↗</button></div>}

        {!error && data && data.results.length > 0 && <nav className="pagination" aria-label="ページネーション"><button disabled={page <= 1 || loading} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 500, behavior: "smooth" }); }}>← 前へ</button><span><b>{String(page).padStart(2, "0")}</b><i>/</i>{String(Math.max(1, Math.ceil(data.count / 21))).padStart(2, "0")}</span><button disabled={!data.next || loading} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 500, behavior: "smooth" }); }}>次へ →</button></nav>}
        <div className="data-credit">GAME DATA POWERED BY <a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a><span>✳</span></div>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark">P</span><span>PLAY<span className="brand-accent">SCAPE</span></span></a><span>あなたの次のお気に入りが、ここに。</span><span className="footer-year">GAME ON. © 2025</span></footer>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)} role="presentation"><section className="game-modal" role="dialog" aria-modal="true" aria-label={`${selected.name}の詳細`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="閉じる">×</button>
        <div className="modal-image">{selected.background_image && <img src={selected.background_image} alt="" />}<div className="modal-image-shade" /><div className="modal-title"><div className="game-genres">{selected.genres?.map((item) => <span key={item.id}>{item.name}</span>)}</div><h2>{selected.name}</h2></div></div>
        <div className="modal-content">{detailLoading && <div className="detail-loading"><span className="tiny-spinner" /> 詳細を読み込み中...</div>}<div className="detail-stats"><div><small>評価</small><b>★ {selected.rating ? selected.rating.toFixed(1) : "—"}<em> / 5</em></b></div><div><small>発売日</small><b>{formatDate(selected.released)}</b></div>{selected.metacritic && <div><small>METACRITIC</small><b>{selected.metacritic}<em> / 100</em></b></div>}</div>{selected.description_raw && <p className="game-description">{selected.description_raw}</p>}<div className="detail-platforms"><small>対応機種</small><p>{selected.platforms?.map((item) => item.platform.name).join(" · ") || "情報なし"}</p></div><div className="modal-actions"><button className={`modal-favorite ${favorites.includes(selected.id) ? "is-favorite" : ""}`} onClick={() => toggleFavorite(selected.id)}>{favorites.includes(selected.id) ? "♥ お気に入り済み" : "♡ お気に入りに追加"}</button>{selected.website && <a className="official-link" href={selected.website} target="_blank" rel="noreferrer">公式サイトを見る ↗</a>}</div><div className="detail-credit">GAME DATA POWERED BY <a href="https://rawg.io/" target="_blank" rel="noreferrer">RAWG</a></div></div>
      </section></div>}
    </main>
  );
}
