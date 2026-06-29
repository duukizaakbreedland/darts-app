type PlayerScoreProps = {
  name: string
  score: number
  setsWon: number
  legsWon: number
  avg: number
  rounds: number
  darts: number
  isActive: boolean
  lastScore: number | null
  lastBust: boolean
}

function MiniStat({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="px-3 text-xs whitespace-nowrap">
      <span className="text-slate-600">{label}: </span>
      <span className={`font-bold ${active ? 'text-slate-300' : 'text-slate-600'}`}>{value}</span>
    </div>
  )
}

export function PlayerScore({
  name, score, setsWon, legsWon, avg, rounds, darts, isActive, lastScore, lastBust,
}: PlayerScoreProps) {
  return (
    <div className={`flex-1 flex flex-col items-center text-center p-4 border-b-2 transition-all ${
      isActive ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Naam */}
      <div className="flex items-center justify-center gap-2 mb-1 max-w-full">
        {isActive && (
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
        )}
        <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
          {name}
        </span>
      </div>

      {/* Sets / legs */}
      <div className="text-[11px] text-slate-500 mb-3">
        <span className={`font-bold ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{setsWon}</span> sets
        <span className="mx-1 text-slate-700">·</span>
        <span className={`font-bold ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{legsWon}</span> legs
      </div>

      {/* Grote score */}
      <div className={`text-6xl font-bold leading-none tracking-tight ${
        isActive ? 'text-slate-100' : 'text-slate-600'
      }`}>
        {score}
      </div>

      {/* Laatste worp */}
      <div className="mt-2 h-5">
        {lastScore !== null && (
          <span className="text-xs text-slate-500">
            laatste:{' '}
            {lastBust ? (
              <span className="font-bold text-red-400">bust</span>
            ) : (
              <span className="font-bold text-slate-400">{lastScore}</span>
            )}
          </span>
        )}
      </div>

      {/* Scheidingslijn + mini-stats: gemiddelde · ronde · darts */}
      <div className="w-full mt-2 pt-3 border-t border-slate-800 flex items-center justify-center divide-x divide-slate-800">
        <MiniStat label="Gem" value={avg.toFixed(1)} active={isActive} />
        <MiniStat label="Ronde" value={String(rounds)} active={isActive} />
        <MiniStat label="Darts" value={String(darts)} active={isActive} />
      </div>
    </div>
  )
}
