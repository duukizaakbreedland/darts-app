type KeypadProps = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onUndo: () => void
  isBust?: boolean
}

export function Keypad({ value, onChange, onConfirm, onUndo, isBust }: KeypadProps) {
  const handleDigit = (digit: string) => {
    if (value.length >= 3) return
    onChange(value + digit)
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const score = parseInt(value || '0')
  const isValid = value.length > 0 && score <= 180 && score >= 0

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-900 border-t border-slate-800">
      {/* Score input display */}
      <div className={`flex items-center justify-center rounded-xl h-14 mb-1 border transition-colors ${
        isBust
          ? 'bg-red-900/20 border-red-700/40'
          : value
          ? 'bg-slate-800 border-blue-700/40'
          : 'bg-slate-800/50 border-slate-700/30'
      }`}>
        {isBust ? (
          <span className="text-lg font-bold text-red-400 tracking-wide">BUST</span>
        ) : (
          <span className={`text-5xl font-bold tracking-wider ${value ? 'text-slate-100' : 'text-slate-700'}`}>
            {value || '—'}
          </span>
        )}
      </div>

      {/* Digit grid */}
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

      {/* Bottom row: undo | 0 | backspace */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onUndo}
          className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-amber-400 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="text-base">↩</span>
          <span>Undo</span>
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-100 text-2xl font-semibold transition-colors"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-300 text-xl transition-colors"
        >
          ⌫
        </button>
      </div>

      {/* Confirm button */}
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
    </div>
  )
}
