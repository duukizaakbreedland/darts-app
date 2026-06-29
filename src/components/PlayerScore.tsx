type PlayerScoreProps = {
  name: string
  score: number
  setsWon: number
  legsWon: number
  avg: number
  isActive: boolean
  lastScore: number | null
}

export function PlayerScore({ name, score, setsWon, legsWon, avg, isActive, lastScore }: PlayerScoreProps) {
  return (
    <div className={`flex-1 flex flex-col p-4 border-b-2 transition-all ${
      isActive
        ? 'bg-blue-900/20 border-blue-500'
        : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Naam + leg/set */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          )}
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
            {name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
          <span className={`font-bold ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{setsWon}</span>
          <span>s</span>
          <span className="mx-0.5 text-slate-700">·</span>
          <span className={`font-bold ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{legsWon}</span>
          <span>l</span>
        </div>
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
            laatste: <span className={`font-bold ${lastScore === 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {lastScore === 0 ? 'bust' : lastScore}
            </span>
          </span>
        )}
      </div>

      {/* Gemiddelde */}
      <div className="mt-2 pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-600">gem. </span>
        <span className={`text-sm font-bold ${isActive ? 'text-slate-400' : 'text-slate-700'}`}>
          {avg.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
