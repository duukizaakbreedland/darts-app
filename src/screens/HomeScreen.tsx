import { useNavigate } from 'react-router-dom'

export function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-5 gap-6 pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Darts</h1>
        <p className="text-slate-500 text-sm mt-1">Goedenavond, Duuk</p>
      </div>

      {/* Quick start */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Snel starten</span>
        <button
          onClick={() => navigate('/new-game')}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl p-5 text-left transition-colors shadow-lg shadow-blue-900/30"
        >
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-lg font-bold">Nieuw spel</div>
          <div className="text-blue-200 text-sm">501 · 1 set · 3 legs</div>
        </button>
      </div>

      {/* Game modes */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Training</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Cricket', emoji: '🏏', path: '/training/cricket' },
            { label: 'Around the Clock', emoji: '🕐', path: '/training/around-the-clock' },
            { label: 'Shanghai', emoji: '🌆', path: '/training/shanghai' },
            { label: 'Checkout', emoji: '✅', path: '/training/checkout' },
          ].map(({ label, emoji, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-4 text-left transition-colors"
            >
              <div className="text-xl mb-2">{emoji}</div>
              <div className="text-sm font-semibold text-slate-200">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-auto flex border-t border-slate-800 pt-4 gap-1">
        {[
          { label: 'Spelen', icon: '🎯', active: true, path: '/' },
          { label: 'Statistieken', icon: '📊', active: false, path: '/stats' },
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
