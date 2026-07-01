import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export function SettingsScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-slate-900">
      <div className="flex-1 flex flex-col px-5 gap-6 pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Instellingen</h1>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Beheer</span>
          <button
            onClick={() => navigate('/profiles')}
            className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl px-5 h-14 active:bg-slate-700 transition-colors"
          >
            <span className="text-slate-100 font-semibold">Profielen</span>
            <span className="text-slate-500 text-xl leading-none">›</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
