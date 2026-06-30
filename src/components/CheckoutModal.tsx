import { useState } from 'react'

interface CheckoutModalProps {
  playerName: string
  onConfirm: (dartsForCheckout: number, dartsAtDouble: number) => void
  onCancel: () => void
}

function DartsChoice({
  label, value, onSelect, accent,
}: {
  label: string
  value: number | null
  onSelect: (n: number) => void
  accent: 'blue' | 'emerald'
}) {
  const selected = accent === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3].map(d => (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className={`flex-1 h-14 rounded-xl text-xl font-bold transition-colors ${
              value === d ? `${selected} text-white` : 'bg-slate-700 border border-slate-600 text-slate-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CheckoutModal({ playerName, onConfirm, onCancel }: CheckoutModalProps) {
  const [checkoutDarts, setCheckoutDarts] = useState<number | null>(null)
  const [doubleDarts, setDoubleDarts] = useState<number | null>(null)

  const canConfirm = checkoutDarts !== null && doubleDarts !== null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm flex flex-col gap-5 p-6 shadow-2xl">
        <div className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h2 className="text-slate-100 font-bold text-lg">{playerName} gooit uit!</h2>
          <p className="text-slate-500 text-sm mt-1">Even vastleggen voor je statistieken</p>
        </div>

        <DartsChoice
          label="Darts voor de checkout"
          value={checkoutDarts}
          onSelect={setCheckoutDarts}
          accent="blue"
        />

        <DartsChoice
          label="Darts op een dubbel"
          value={doubleDarts}
          onSelect={setDoubleDarts}
          accent="emerald"
        />

        <div className="flex gap-3 mt-1">
          <button
            onClick={onCancel}
            className="px-4 h-12 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={() => canConfirm && onConfirm(checkoutDarts!, doubleDarts!)}
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
