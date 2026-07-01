import { useLocation, useNavigate } from 'react-router-dom'
import type { GamePlayerStats } from '../lib/gameStats'

interface OverState {
  winner: string
  rematchPath?: string
  playerStats?: GamePlayerStats[]
}

const ROWS: { label: string; get: (s: GamePlayerStats) => string | number }[] = [
  { label: '3-dart gem.', get: s => s.threeDartAvg.toFixed(1) },
  { label: 'First 9', get: s => s.first9Avg.toFixed(1) },
  { label: 'Legs', get: s => s.legsWon },
  { label: 'Beste leg', get: s => s.bestLeg ?? '–' },
  { label: 'Hoogste worp', get: s => s.highestScore || '–' },
  { label: 'Hoogste finish', get: s => s.highestFinish || '–' },
  { label: "180's", get: s => s.count180 },
  { label: '140+', get: s => s.count140plus },
  { label: '100+', get: s => s.count100plus },
  { label: 'Darts', get: s => s.totalDarts },
]

export function GameOverScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { winner, rematchPath, playerStats } = (location.state as OverState) ?? { winner: '?' }
  const rematch = rematchPath ?? '/new-game'

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-8 gap-6 pt-[calc(env(safe-area-inset-top)_+_2rem)]">
      <div className="text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-2xl font-bold text-slate-100">{winner} wint!</h1>
      </div>

      {/* Stats naast elkaar */}
      {playerStats && playerStats.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Spelernamen */}
          <div className="flex items-center border-b border-slate-800">
            <div className="w-28 flex-shrink-0 px-3 py-2" />
            {playerStats.map((s, i) => (
              <div key={i} className="flex-1 px-2 py-2 text-center text-sm font-bold text-slate-100 truncate">
                {s.name}
              </div>
            ))}
          </div>
          {ROWS.map((row, ri) => (
            <div key={row.label} className={`flex items-center ${ri % 2 ? 'bg-slate-900/30' : ''}`}>
              <div className="w-28 flex-shrink-0 px-3 py-2 text-xs text-slate-500 uppercase tracking-wide">
                {row.label}
              </div>
              {playerStats.map((s, i) => (
                <div key={i} className="flex-1 px-2 py-2 text-center text-sm font-semibold text-slate-200">
                  {row.get(s)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={() => navigate(rematch)}
          className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-colors shadow-lg shadow-blue-900/30"
        >
          Nieuw spel
        </button>
        <button
          onClick={() => navigate('/')}
          className="h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition-colors"
        >
          Terug naar home
        </button>
      </div>
    </div>
  )
}
