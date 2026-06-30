import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

const TRAINING: { name: string; path?: string }[] = [
  { name: 'Cricket' },
  { name: 'Around the Clock', path: '/training/atc' },
  { name: 'Shanghai' },
  { name: 'Checkout' },
]

export function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-slate-900">
      <div className="flex-1 flex flex-col px-5 gap-7 pb-6 pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Darts</h1>

        {/* Nieuw spel */}
        <button
          onClick={() => navigate('/new-game')}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-2xl p-5 text-left transition-colors shadow-lg shadow-blue-900/30"
        >
          <div className="text-lg font-bold text-white">Nieuw spel</div>
          <div className="text-sm text-blue-200/80 mt-0.5">X01 — 301 / 501 / 701</div>
        </button>

        {/* Training */}
        <div className="flex flex-col gap-3">
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Training</span>
          <div className="grid grid-cols-2 gap-3">
            {TRAINING.map(({ name, path }) =>
              path ? (
                <button
                  key={name}
                  onClick={() => navigate(path)}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-left active:bg-slate-700 transition-colors"
                >
                  <div className="text-sm font-semibold text-slate-100">{name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-blue-400 mt-3">Spelen</div>
                </button>
              ) : (
                <div
                  key={name}
                  className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 select-none"
                >
                  <div className="text-sm font-semibold text-slate-400">{name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600 mt-3">Binnenkort</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
