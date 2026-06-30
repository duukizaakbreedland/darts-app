type KeypadProps = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onNoScore: () => void
  onUndo: () => void
  canUndo: boolean
  isBust?: boolean
}

export function Keypad({ value, onChange, onConfirm, onNoScore, onUndo, canUndo, isBust }: KeypadProps) {
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
      {/* Bovenste rij: undo | invoer | Bevestig / No Score */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`h-20 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-slate-700 text-slate-300'
              : 'bg-slate-800/50 border-slate-800 text-slate-700 cursor-not-allowed'
          }`}
        >
          <span className="text-base">↩</span>
          <span>Undo</span>
        </button>

        <div className={`flex items-center justify-center rounded-xl border-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] transition-colors ${
          isBust
            ? 'bg-red-950 border-red-600/60'
            : value
            ? 'bg-slate-950 border-blue-500/70'
            : 'bg-slate-950 border-slate-700'
        }`}>
          {isBust ? (
            <span className="text-lg font-bold text-red-400 tracking-wide">BUST</span>
          ) : (
            <span className={`text-5xl font-bold tracking-wider ${value ? 'text-white' : 'text-slate-700'}`}>
              {value || '—'}
            </span>
          )}
        </div>

        {hasValue ? (
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className={`h-20 rounded-xl text-lg font-bold transition-all ${
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
            className="h-20 rounded-xl text-lg font-bold bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-900/40 transition-all"
          >
            No Score
          </button>
        )}
      </div>

      {/* Cijfers + (leeg) 0 backspace */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => handleDigit(k)}
            className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-100 text-2xl font-semibold transition-colors"
          >
            {k}
          </button>
        ))}

        {/* Leeg vak links van de 0 */}
        <div aria-hidden />

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
    </div>
  )
}
