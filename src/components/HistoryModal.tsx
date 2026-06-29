import type { Visit } from '../hooks/useX01Game'

interface HistoryModalProps {
  players: string[]
  visits: Visit[]
  currentLeg: number
  currentSet: number
  onClose: () => void
}

export function HistoryModal({ players, visits, currentLeg, currentSet, onClose }: HistoryModalProps) {
  const legVisits = visits.filter(v => v.leg === currentLeg && v.set === currentSet)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm flex flex-col max-h-[80svh] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-slate-100 font-bold text-lg">Worpen — Leg {currentLeg}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl transition-colors">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex flex-col gap-1.5">
          {legVisits.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">Nog geen worpen in deze leg.</p>
          )}
          {legVisits.map((v, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                v.bust ? 'bg-red-900/20 border border-red-800/40' : 'bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                <span className="text-sm font-semibold text-slate-300">{players[v.player]}</span>
              </div>
              <div className="flex items-center gap-3">
                {v.bust ? (
                  <span className="text-sm font-bold text-red-400">BUST</span>
                ) : (
                  <span className="text-sm font-bold text-slate-100">{v.points}</span>
                )}
                {v.checkout && <span className="text-xs text-emerald-400 font-medium">✓ uit</span>}
                <span className="text-xs text-slate-500 w-10 text-right">{v.remainingAfter}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
