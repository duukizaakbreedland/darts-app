import { useEffect, useState } from 'react'
import { TabScreen } from '../components/TabScreen'
import { Segmented } from '../components/Segmented'
import {
  fetchX01Stats,
  fetchRecentGames,
  fetchTrainingStats,
  type PlayerStats,
  type StatsPeriod,
  type RecentGame,
  type TrainingStats,
} from '../lib/stats'

// Spel-selectie bovenaan
const GAMES: { key: string; label: string }[] = [
  { key: 'x01', label: 'X01' },
  { key: 'cricket', label: 'Cricket' },
  { key: 'around_the_clock', label: 'Around the Clock' },
  { key: 'shanghai', label: 'Shanghai' },
  { key: 'bobs27', label: "Bob's 27" },
  { key: 'singles', label: 'Singles' },
  { key: 'checkout_training', label: 'Checkout' },
]

// Welke extra cellen tonen we per trainingsspel?
function trainingCells(key: string, s: TrainingStats): { label: string; value: string | number }[] {
  const cells: { label: string; value: string | number }[] = []
  if (key === 'shanghai' || key === 'bobs27') {
    cells.push({ label: 'beste score', value: s.bestScore ?? '–' })
    cells.push({ label: 'gem. score', value: s.avgScore != null ? s.avgScore.toFixed(0) : '–' })
  } else if (key === 'singles') {
    cells.push({ label: 'beste treffers', value: s.bestScore ?? '–' })
    cells.push({ label: 'gem. treffers', value: s.avgScore != null ? s.avgScore.toFixed(1) : '–' })
  } else if (key === 'around_the_clock') {
    cells.push({ label: 'beste (targets)', value: s.bestScore ?? '–' })
  } else if (key === 'checkout_training') {
    const fin = s.extra.finishes ?? 0
    const att = s.extra.attempts ?? 0
    cells.push({ label: 'finishes', value: fin })
    cells.push({ label: 'success', value: att > 0 ? `${Math.round((fin / att) * 100)}%` : '–' })
  }
  return cells
}

function TrainingCard({ gameKey, s }: { gameKey: string; s: TrainingStats }) {
  const winPct = s.gamesPlayed > 0 ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0
  const cells = trainingCells(gameKey, s)
  return (
    <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-slate-100">{s.name}</span>
        <span className="text-xs text-slate-500">
          <span className="text-slate-300 font-bold">{s.gamesWon}</span>/{s.gamesPlayed} · {winPct}%
        </span>
      </div>
      {cells.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800 pt-1">
          {cells.map(c => (
            <div key={c.label} className="flex flex-col items-center py-2">
              <span className="text-lg font-bold text-slate-100">{c.value}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide text-center leading-tight">{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center py-2">
      <span className="text-lg font-bold text-slate-100">{value}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wide text-center leading-tight">{label}</span>
    </div>
  )
}

function PlayerCard({ s }: { s: PlayerStats }) {
  const winPct = s.gamesPlayed > 0 ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0
  return (
    <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-slate-100">{s.name}</span>
        <span className="text-xs text-slate-500">
          <span className="text-slate-300 font-bold">{s.gamesWon}</span>/{s.gamesPlayed} · {winPct}%
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-y border-slate-800">
        <StatCell label="3-dart gem" value={s.threeDartAvg.toFixed(1)} />
        <StatCell label="first 9" value={s.first9Avg.toFixed(1)} />
        <StatCell label="darts/leg" value={s.avgDartsPerLeg ? s.avgDartsPerLeg.toFixed(0) : '–'} />
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
        <StatCell label="beste leg" value={s.bestLeg ?? '–'} />
        <StatCell label="hoogste finish" value={s.highestFinish || '–'} />
        <StatCell label="hoogste worp" value={s.highestScore || '–'} />
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-800">
        <StatCell label="100+" value={s.count100plus} />
        <StatCell label="120+" value={s.count120plus} />
        <StatCell label="140+" value={s.count140plus} />
      </div>
    </div>
  )
}

const DETAIL_ROWS: { label: string; get: (p: RecentGame['players'][number]) => string | number }[] = [
  { label: '3-dart gem.', get: p => p.threeDartAvg.toFixed(1) },
  { label: 'First 9', get: p => p.first9Avg.toFixed(1) },
  { label: 'Legs', get: p => p.legsWon },
  { label: 'Beste leg', get: p => p.bestLeg ?? '–' },
  { label: 'Hoogste finish', get: p => p.highestFinish || '–' },
  { label: '100+', get: p => p.count100plus },
  { label: '120+', get: p => p.count120plus },
  { label: '140+', get: p => p.count140plus },
]

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

function GameRow({ game }: { game: RecentGame }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-slate-800/60 border border-slate-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-slate-700/40 transition-colors">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100 truncate">
            {game.players.map(p => p.name).join(' vs ')}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {game.startingScore} · {formatDate(game.completedAt)}
          </div>
        </div>
        <span className="text-slate-500 text-lg flex-shrink-0 ml-2">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-800">
          <div className="flex items-center border-b border-slate-800">
            <div className="w-28 flex-shrink-0 px-3 py-2" />
            {game.players.map(p => (
              <div key={p.playerId} className={`flex-1 px-2 py-2 text-center text-sm font-bold truncate ${p.isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                {p.isWinner ? '🏆 ' : ''}{p.name}
              </div>
            ))}
          </div>
          {DETAIL_ROWS.map((row, ri) => (
            <div key={row.label} className={`flex items-center ${ri % 2 ? 'bg-slate-900/30' : ''}`}>
              <div className="w-28 flex-shrink-0 px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{row.label}</div>
              {game.players.map(p => (
                <div key={p.playerId} className="flex-1 px-2 py-2 text-center text-sm font-semibold text-slate-200">
                  {row.get(p)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function StatsScreen() {
  const [gameKey, setGameKey] = useState('x01')
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [recent, setRecent] = useState<RecentGame[]>([])
  const [training, setTraining] = useState<TrainingStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isX01 = gameKey === 'x01'

  useEffect(() => {
    setLoading(true)
    setError(null)
    if (isX01) {
      Promise.all([fetchX01Stats(period), fetchRecentGames(10)])
        .then(([s, r]) => {
          setStats(s)
          setRecent(r)
        })
        .catch(() => setError('Kon statistieken niet laden. Controleer je internetverbinding.'))
        .finally(() => setLoading(false))
    } else {
      fetchTrainingStats(gameKey)
        .then(setTraining)
        .catch(() => setError('Kon statistieken niet laden. Controleer je internetverbinding.'))
        .finally(() => setLoading(false))
    }
  }, [gameKey, period, isX01])

  return (
    <TabScreen>
      <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Statistieken</h1>

      {/* Spel-selector + periode — samen bovenaan plakken tijdens scrollen */}
      <div className="sticky top-0 z-20 bg-slate-900 -mx-5 px-5 pb-3 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pt-1">
          {GAMES.map(g => (
            <button
              key={g.key}
              onClick={() => setGameKey(g.key)}
              className={`h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                gameKey === g.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {isX01 && (
          <Segmented<StatsPeriod>
            label="Periode"
            value={period}
            onChange={setPeriod}
            options={[
              { label: 'Alles', value: 'all' },
              { label: 'Dag', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Maand', value: 'month' },
            ]}
          />
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-10">Laden…</p>
      ) : isX01 ? (
        stats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-slate-500 text-sm">Geen potjes in deze periode.</p>
            <p className="text-slate-600 text-xs">Speel een X01-potje en je statistieken verschijnen hier.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {stats.map(s => (
                <PlayerCard key={s.playerId} s={s} />
              ))}
            </div>
            {recent.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Recente potjes</span>
                {recent.map(g => (
                  <GameRow key={g.id} game={g} />
                ))}
              </div>
            )}
          </>
        )
      ) : training.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-slate-500 text-sm">Nog geen potjes gespeeld.</p>
          <p className="text-slate-600 text-xs">Speel dit spel en je statistieken verschijnen hier.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {training.map(s => (
            <TrainingCard key={s.playerId} gameKey={gameKey} s={s} />
          ))}
        </div>
      )}
    </TabScreen>
  )
}
