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
    <div className="flex flex-col items-center px-2">
      <span className={`text-sm font-bold leading-tight ${active ? 'text-slate-300' : 'text-slate-600'}`}>
        {value}
      </span>
      <span className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</span>
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
      <div className="text-[11px] text-slate-500 mb-2">
        <span className={`font-bold ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{setsWon}</span> sets
        <span className="mx-1 text-slate-700">·</span>
        <span className={`font-bold ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{legsWon}</span> legs
      </div>

      {/* Mini-stats: gemiddelde · ronde · darts */}
      <div className="flex items-stretch divide-x divide-slate-800 mb-2">
        <MiniStat label="gem" value={avg.toFixed(1)} active={isActive} />
        <MiniStat label="ronde" value={String(rounds)} active={isActive} />
        <MiniStat label="darts" value={String(darts)} active={isActive} />
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
    </div>
  )
}
