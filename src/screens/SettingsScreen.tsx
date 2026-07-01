import { useNavigate } from 'react-router-dom'
import { TabScreen } from '../components/TabScreen'

export function SettingsScreen() {
  const navigate = useNavigate()

  return (
    <TabScreen>
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
    </TabScreen>
  )
}
