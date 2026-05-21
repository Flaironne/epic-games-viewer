import { useState, useEffect, useCallback } from 'react'
import { fetchAllGames } from './api/epicGames'
import './index.css'

// ─── Components ──────────────────────────────────────────────────────────────

function GameCard({ name }: { name: string }) {
  return (
    <li className="game-card">
      <span className="game-icon">🎮</span>
      <span className="game-name">{name}</span>
    </li>
  )
}

function Loader() {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>Loading games…</p>
    </div>
  )
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="state-box error-box">
      <p>⚠️ {message}</p>
      <button className="btn" onClick={onRetry}>Retry</button>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [games, setGames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(true)

  const loadGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAllGames()
      setGames(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGames() }, [loadGames])

  const filtered = games
    .filter(g => g.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
      return sortAsc ? cmp : -cmp
    })

  return (
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
            {loading ? '⏳' : '↻'} Refresh
          </button>
        </div>

        {!loading && games.length > 0 && (
          <p className="game-count">
            {games.length} game{games.length !== 1 ? 's' : ''} in your library
            {search && filtered.length !== games.length
              ? ` · ${filtered.length} matching`
              : ''}
          </p>
        )}

        <div className="controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search games…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-sort"
            onClick={() => setSortAsc(v => !v)}
            disabled={loading}
            title="Toggle sort order"
          >
            {sortAsc ? 'A → Z' : 'Z → A'}
          </button>
        </div>
      </header>

      <main className="main">
        {loading && <Loader />}
        {!loading && error && <ErrorBox message={error} onRetry={loadGames} />}
        {!loading && !error && games.length === 0 && (
          <div className="state-box">
            <p>No games found. Make sure you are logged in to Epic Games.</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <ul className="game-list">
            {filtered.map(name => (
              <GameCard key={name} name={name} />
            ))}
          </ul>
        )}
        {!loading && !error && games.length > 0 && filtered.length === 0 && (
          <div className="state-box">
            <p>No games match "<strong>{search}</strong>".</p>
          </div>
        )}
      </main>
    </div>
  )
}
