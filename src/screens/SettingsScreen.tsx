import { BottomNav } from '../components/BottomNav'

export function SettingsScreen() {
  return (
    <div className="flex flex-col min-h-svh bg-slate-900">
      <div className="flex-1 flex flex-col px-5 gap-6 pb-6 pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Instellingen</h1>

        <div className="flex flex-col gap-3">
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Profielen</span>
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 text-center">
            <p className="text-slate-400 text-sm">Profielbeheer komt eraan.</p>
            <p className="text-slate-600 text-xs mt-1">Hier maak je straks spelers aan en koppel je hun statistieken.</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
