import { BottomNav } from '../components/BottomNav'

export function StatsScreen() {
  return (
    <div className="flex flex-col min-h-svh bg-slate-900">
      <div className="flex-1 flex flex-col px-5 gap-6 pb-[calc(3.5rem_+_env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Statistieken</h1>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-slate-500 text-sm">Nog geen gespeelde potjes.</p>
          <p className="text-slate-600 text-xs">Statistieken verschijnen na je eerste spel.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
