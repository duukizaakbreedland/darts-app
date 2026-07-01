import { useEffect, useState } from 'react'
import { TabScreen } from '../components/TabScreen'
import { Segmented } from '../components/Segmented'
import { fetchX01Stats, type PlayerStats, type StatsPeriod } from '../lib/stats'

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

export function StatsScreen() {
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchX01Stats(period)
      .then(setStats)
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
      <div className="-mt-3">
        <button
          onClick={() => setPeriod('last10')}
          className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
            period === 'last10'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}
        >
          Laatste 10 potjes
        </button>
      </div>

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
        <div className="flex flex-col gap-3">
          {stats.map(s => (
            <PlayerCard key={s.playerId} s={s} />
          ))}
        </div>
      )}
    </TabScreen>
  )
}
