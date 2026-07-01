import { useLocation, useNavigate } from 'react-router-dom'

export interface StatTable {
  players: string[]
  winnerIndex: number
  rows: { label: string; values: (string | number)[] }[]
}

interface OverState {
  winner: string
  rematchPath?: string
  statTable?: StatTable
}

export function GameOverScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { winner, rematchPath, statTable } = (location.state as OverState) ?? { winner: '?' }
  const rematch = rematchPath ?? '/new-game'

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-8 gap-6 pt-[calc(env(safe-area-inset-top)_+_2rem)]">
      <div className="text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-2xl font-bold text-slate-100">{winner} wint!</h1>
      </div>

      {statTable && statTable.rows.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center border-b border-slate-800">
            <div className="w-32 flex-shrink-0 px-3 py-2" />
            {statTable.players.map((name, i) => (
              <div
                key={i}
                className={`flex-1 px-2 py-2 text-center text-sm font-bold truncate ${
                  i === statTable.winnerIndex ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                {i === statTable.winnerIndex ? '🏆 ' : ''}
                {name}
              </div>
            ))}
          </div>
          {statTable.rows.map((row, ri) => (
            <div key={row.label} className={`flex items-center ${ri % 2 ? 'bg-slate-900/30' : ''}`}>
              <div className="w-32 flex-shrink-0 px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                {row.label}
              </div>
              {row.values.map((v, i) => (
                <div key={i} className="flex-1 px-2 py-2 text-center text-sm font-semibold text-slate-200">
                  {v}
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
