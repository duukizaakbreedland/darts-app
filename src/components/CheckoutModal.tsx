import { useState } from 'react'
import { finishingDouble } from '../lib/checkouts'

interface CheckoutModalProps {
  playerName: string
  remaining: number // score voor de finish-beurt
  onConfirm: (darts: number, double: string) => void
  onCancel: () => void
}

const DOUBLE_OPTIONS = ['D20', 'D16', 'D10', 'D8', 'D4', 'Bull', 'Anders']

export function CheckoutModal({ playerName, remaining, onConfirm, onCancel }: CheckoutModalProps) {
  const suggested = finishingDouble(remaining)
  const [darts, setDarts] = useState<number | null>(null)
  const [double, setDouble] = useState<string>(suggested ?? '')

  const canConfirm = darts !== null && double !== ''

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm flex flex-col gap-5 p-6 shadow-2xl">
        <div className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h2 className="text-slate-100 font-bold text-lg">{playerName} gooit uit!</h2>
          <p className="text-slate-500 text-sm mt-1">Even twee dingen vastleggen voor je stats</p>
        </div>

        {/* Aantal darts */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Hoeveel pijlen?</span>
          <div className="flex gap-2">
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => setDarts(d)}
                className={`flex-1 h-14 rounded-xl text-xl font-bold transition-colors ${
                  darts === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 border border-slate-600 text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Welke dubbel */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Op welke dubbel?</span>
          <div className="grid grid-cols-4 gap-2">
            {DOUBLE_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDouble(d)}
                className={`h-12 rounded-xl text-sm font-bold transition-colors ${
                  double === d
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 border border-slate-600 text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-1">
          <button
            onClick={onCancel}
            className="px-4 h-12 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={() => canConfirm && onConfirm(darts!, double)}
            disabled={!canConfirm}
            className={`flex-1 h-12 rounded-xl font-bold transition-colors ${
              canConfirm
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-600 cursor-not-allowed'
            }`}
          >
            Bevestig leg
          </button>
        </div>
      </div>
    </div>
  )
}
