import { useLocation, useNavigate } from 'react-router-dom'

export function GameOverScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { winner } = (location.state as { winner: string }) ?? { winner: '?' }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh bg-slate-900 px-8 pb-8 gap-8 pt-[calc(env(safe-area-inset-top)_+_2rem)]">
      <div className="text-center">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{winner} wint!</h1>
        <p className="text-slate-500">Goed gespeeld</p>
      </div>

      <div className="flex flex-col w-full max-w-xs gap-3">
        <button
          onClick={() => navigate('/new-game')}
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
