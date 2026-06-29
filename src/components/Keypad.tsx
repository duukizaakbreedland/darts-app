type KeypadProps = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onNoScore: () => void
  onUndo: () => void
  onQuickScore: (score: number) => void
  canUndo: boolean
  isBust?: boolean
}

const QUICK_SCORES = [26, 41, 45, 60, 85, 100, 140, 180]

export function Keypad({ value, onChange, onConfirm, onNoScore, onUndo, onQuickScore, canUndo, isBust }: KeypadProps) {
  const handleDigit = (digit: string) => {
    if (value.length >= 3) return
    onChange(value + digit)
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const score = parseInt(value || '0')
  const hasValue = value.length > 0
  const isValid = hasValue && score <= 180

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-900 border-t border-slate-800">
      {/* Snelknoppen — gecentreerd */}
      <div className="flex flex-wrap gap-1.5 justify-center pb-1">
        {QUICK_SCORES.map(s => (
          <button
            key={s}
            onClick={() => onQuickScore(s)}
            className="h-9 px-3.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold active:bg-slate-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Undo | invoer | backspace */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`h-14 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-slate-700 text-amber-400'
              : 'bg-slate-800/50 border-slate-800 text-slate-700 cursor-not-allowed'
          }`}
        >
          <span className="text-base">↩</span>
          <span>Undo</span>
        </button>

        <div className={`flex items-center justify-center rounded-xl border transition-colors ${
          isBust
            ? 'bg-red-900/20 border-red-700/40'
            : value
            ? 'bg-slate-800 border-blue-700/40'
            : 'bg-slate-800/50 border-slate-700/30'
        }`}>
          {isBust ? (
            <span className="text-base font-bold text-red-400 tracking-wide">BUST</span>
          ) : (
            <span className={`text-4xl font-bold tracking-wider ${value ? 'text-slate-100' : 'text-slate-700'}`}>
              {value || '—'}
            </span>
          )}
        </div>

        <button
          onClick={handleBackspace}
          className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-300 text-xl transition-colors"
        >
          ⌫
        </button>
      </div>

      {/* Cijfers 1-9 */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => handleDigit(k)}
            className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-100 text-2xl font-semibold transition-colors"
          >
            {k}
          </button>
        ))}
      </div>

      {/* 0 */}
      <button
        onClick={() => handleDigit('0')}
        className="h-14 w-full rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-100 text-2xl font-semibold transition-colors"
      >
        0
      </button>

      {/* No Score (rood, geen invoer) / Bevestig (met invoer) */}
      {hasValue ? (
        <button
          onClick={onConfirm}
          disabled={!isValid}
          className={`h-16 rounded-xl text-xl font-bold transition-all ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-900/40'
              : 'bg-slate-800 border border-slate-700 text-slate-700 cursor-not-allowed'
          }`}
        >
          Bevestig
        </button>
      ) : (
        <button
          onClick={onNoScore}
          className="h-16 rounded-xl text-xl font-bold bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-900/40 transition-all"
        >
          No Score
        </button>
      )}
    </div>
  )
}
