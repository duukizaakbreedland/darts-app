interface OnScreenKeyboardProps {
  label: string
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

export function OnScreenKeyboard({ label, value, onChange, onClose }: OnScreenKeyboardProps) {
  const handleKey = (key: string) => {
    if (value.length >= 16) return
    // Auto-hoofdletter: eerste letter of na een spatie
    const upper = value.length === 0 || value.endsWith(' ')
    onChange(value + (upper ? key.toUpperCase() : key))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="bg-slate-800 border-t border-slate-700 rounded-t-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header: huidig veld + Klaar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <span className="text-xs text-slate-500 uppercase tracking-widest truncate">{label}</span>
          <button
            onClick={onClose}
            className="px-5 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold flex-shrink-0"
          >
            Klaar
          </button>
        </div>

        {/* Toetsen */}
        <div className="flex flex-col gap-1.5 p-2 pb-4">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1.5 justify-center">
              {ri === 2 && (
                <div className="flex-[0.5]" />
              )}
              {row.map(k => (
                <button
                  key={k}
                  onClick={() => handleKey(k)}
                  className="flex-1 h-11 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-100 text-base font-semibold uppercase transition-colors"
                >
                  {k}
                </button>
              ))}
              {ri === 2 && (
                <button
                  onClick={() => onChange(value.slice(0, -1))}
                  className="flex-[1.5] h-11 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-300 text-lg transition-colors"
                >
                  ⌫
                </button>
              )}
            </div>
          ))}

          {/* Spatie */}
          <div className="flex gap-1.5 justify-center mt-0.5">
            <button
              onClick={() => value.length > 0 && !value.endsWith(' ') && onChange(value + ' ')}
              className="flex-[4] h-11 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-400 text-sm font-medium transition-colors"
            >
              spatie
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
