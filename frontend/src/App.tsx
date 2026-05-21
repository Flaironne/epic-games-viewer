import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAllGames } from "./api/epicGames";
import "./index.css";

type ViewMode = "list" | "grid";

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ loading }: { loading: boolean }) {
  // Reste visible 600 ms après la fin pour laisser le temps à l'animation
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="progress-track">
      <div
        className={`progress-bar ${loading ? "progress-bar--running" : "progress-bar--done"}`}
      />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="7" width="14" height="2" rx="1" />
      <rect x="1" y="12" width="14" height="2" rx="1" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function GameCard({ name, view }: { name: string; view: ViewMode }) {
  return (
    <li className={`game-card game-card--${view}`} title={name}>
      <span className="game-icon">🎮</span>
      <span className="game-name">{name}</span>
    </li>
  );
}

function ViewToggle({
  view,
  onChange,
  disabled,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
  disabled: boolean;
}) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      <button
        className={`view-btn ${view === "list" ? "view-btn--active" : ""}`}
        onClick={() => onChange("list")}
        disabled={disabled}
        title="List view"
        aria-pressed={view === "list"}
      >
        <IconList />
      </button>
      <button
        className={`view-btn ${view === "grid" ? "view-btn--active" : ""}`}
        onClick={() => onChange("grid")}
        disabled={disabled}
        title="Grid view"
        aria-pressed={view === "grid"}
      >
        <IconGrid />
      </button>
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="state-box error-box">
      <p>⚠️ {message}</p>
      <button className="btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [games, setGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");

  // AbortController pour annuler les requêtes en cours si l'utilisateur clique Refresh
  const abortRef = useRef<AbortController | null>(null);

  const loadGames = useCallback(() => {
    // Annule le fetch précédent s'il tourne encore
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setLoadingPage(0);
    setError(null);
    setGames([]);

    fetchAllGames(({ games: current, page }) => {
      setGames(current); // mise à jour incrémentale : les jeux apparaissent au fur et à mesure
      setLoadingPage(page);
    }, controller.signal)
      .then(() => setLoading(false))
      .catch((e: unknown) => {
        if ((e as { name?: string }).name === "AbortError") return; // Refresh volontaire
        setError(e instanceof Error ? e.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadGames();
    return () => abortRef.current?.abort();
  }, [loadGames]);

  const filtered = games
    .filter((g) => g.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
      return sortAsc ? cmp : -cmp;
    });

  // console.log("All my games :", games);

  return (
    <>
      <ProgressBar loading={loading} />

      <div className="app">
        <header className="header">
          <div className="header-top">
            <h1 className="title">
              <span className="title-icon">🎮</span>
              Epic Library Viewer
            </h1>
            <button
              className="btn btn-refresh"
              onClick={loadGames}
              disabled={loading}
              title="Refresh library"
            >
              {loading ? "⏳" : "↻"} Refresh
            </button>
          </div>

          <p className="game-count">
            {
              loading
                ? `Loading… ${games.length > 0 ? `${games.length} games found` : `page ${loadingPage + 1}`}`
                : games.length > 0
                  ? `${games.length} game${games.length !== 1 ? "s" : ""} in your library${search && filtered.length !== games.length ? ` · ${filtered.length} matching` : ""}`
                  : " " /* espace insécable pour garder la hauteur */
            }
          </p>

          <div className="controls">
            <input
              className="search-input"
              type="search"
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading && games.length === 0}
            />
            <button
              className="btn btn-sort"
              onClick={() => setSortAsc((v) => !v)}
              disabled={loading && games.length === 0}
              title="Toggle sort order"
            >
              {sortAsc ? "A → Z" : "Z → A"}
            </button>
            <ViewToggle
              view={view}
              onChange={setView}
              disabled={loading && games.length === 0}
            />
          </div>
        </header>

        <main className="main">
          {error && <ErrorBox message={error} onRetry={loadGames} />}

          {!error && games.length === 0 && !loading && (
            <div className="state-box">
              <p>No games found. Make sure you are logged in to Epic Games.</p>
            </div>
          )}

          {!error && filtered.length > 0 && (
            <ul className={`game-list game-list--${view}`}>
              {filtered.map((name) => (
                <GameCard key={name} name={name} view={view} />
              ))}
            </ul>
          )}

          {!error && !loading && games.length > 0 && filtered.length === 0 && (
            <div className="state-box">
              <p>
                No games match "<strong>{search}</strong>".
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
