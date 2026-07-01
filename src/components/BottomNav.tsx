import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Spelen', path: '/' },
  { label: 'Statistieken', path: '/stats' },
  { label: 'Instellingen', path: '/settings' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="flex-shrink-0 flex border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ label, path }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="relative flex-1 flex items-center justify-center h-11 transition-colors"
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-full" />
            )}
            <span className={`text-base ${active ? 'text-blue-400 font-semibold' : 'text-slate-400 font-medium'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
