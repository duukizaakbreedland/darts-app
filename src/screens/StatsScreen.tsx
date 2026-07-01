import { useEffect, useState } from 'react'
import { TabScreen } from '../components/TabScreen'
import { Segmented } from '../components/Segmented'
import {
  fetchX01Stats,
  fetchRecentGames,
  type PlayerStats,
  type StatsPeriod,
  type RecentGame,
} from '../lib/stats'

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
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [recent, setRecent] = useState<RecentGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchX01Stats(period), fetchRecentGames(10)])
      .then(([s, r]) => {
        setStats(s)
        setRecent(r)
      })
      .catch(() => setError('Kon statistieken niet laden. Controleer je internetverbinding.'))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <TabScreen>
      <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Statistieken</h1>

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

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-10">Laden…</p>
      ) : stats.length === 0 ? (
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
      )}
    </TabScreen>
  )
}
