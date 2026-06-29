type PlayerScoreProps = {
  name: string
  score: number
  setsWon: number
  legsWon: number
  avg: number
  isActive: boolean
  checkout?: string
}

export function PlayerScore({ name, score, setsWon, legsWon, avg, isActive, checkout }: PlayerScoreProps) {
  const isCheckoutRange = score <= 170 && score > 1

  return (
    <div className={`flex-1 flex flex-col p-4 border-b-2 transition-all ${
      isActive
        ? 'bg-blue-900/20 border-blue-500'
        : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Name + leg/set indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          )}
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
            {name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className={`font-bold ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{setsWon}</span>
          <span>sets</span>
          <span className="mx-1 text-slate-700">|</span>
          <span className={`font-bold ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{legsWon}</span>
          <span>legs</span>
        </div>
      </div>

      {/* Big score */}
      <div className={`text-6xl font-bold leading-none tracking-tight ${
        isActive ? 'text-slate-100' : 'text-slate-600'
      }`}>
        {score}
      </div>

      {/* Checkout hint */}
      <div className="mt-2 h-4">
        {isActive && isCheckoutRange && checkout && (
          <span className="text-xs text-emerald-400 font-medium">
            ✓ {checkout}
          </span>
        )}
      </div>

      {/* Avg */}
      <div className="mt-3 pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-600">gem. </span>
        <span className={`text-sm font-bold ${isActive ? 'text-slate-400' : 'text-slate-700'}`}>
          {avg.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
