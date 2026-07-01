import { useEffect, useState } from 'react'
import { TabScreen } from '../components/TabScreen'
import { fetchX01Stats, type PlayerStats } from '../lib/stats'

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center py-2">
      <span className="text-xl font-bold text-slate-100">{value}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function PlayerCard({ s }: { s: PlayerStats }) {
  return (
    <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-slate-100">{s.name}</span>
        <span className="text-xs text-slate-500">
          <span className="text-slate-300 font-bold">{s.gamesWon}</span>/{s.gamesPlayed} gewonnen
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-y border-slate-800">
        <StatCell label="3-dart gem" value={s.threeDartAvg.toFixed(1)} />
        <StatCell label="hoogste finish" value={s.highestFinish || '–'} />
        <StatCell label="darts" value={s.totalDarts} />
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-800">
        <StatCell label="180's" value={s.count180} />
        <StatCell label="140+" value={s.count140plus} />
        <StatCell label="100+" value={s.count100plus} />
      </div>
    </div>
  )
}

export function StatsScreen() {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchX01Stats()
      .then(setStats)
      .catch(() => setError('Kon statistieken niet laden. Controleer je internetverbinding.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <TabScreen>
      <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Statistieken</h1>
      <p className="text-xs text-slate-600 uppercase tracking-widest font-medium -mt-3">X01</p>

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm text-center py-10">Laden…</p>
      ) : stats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-slate-500 text-sm">Nog geen gespeelde potjes.</p>
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
