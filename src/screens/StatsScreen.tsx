import { useNavigate } from 'react-router-dom'

export function StatsScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 p-5 gap-6">
      <div className="pt-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Statistieken</h1>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
        <span className="text-4xl">📊</span>
        <p className="text-slate-500 text-sm">Nog geen gespeelde potjes.</p>
        <p className="text-slate-600 text-xs">Statistieken verschijnen na je eerste spel.</p>
      </div>

      <div className="mt-auto flex border-t border-slate-800 pt-4 gap-1">
        {[
          { label: 'Spelen', icon: '🎯', active: false, path: '/' },
          { label: 'Statistieken', icon: '📊', active: true, path: '/stats' },
        ].map(({ label, icon, active, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${active ? 'text-blue-400' : 'text-slate-600'}`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
