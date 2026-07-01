interface SegmentedProps<T extends string | number | boolean> {
  label: string
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}

export function Segmented<T extends string | number | boolean>({
  label, options, value, onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">{label}</span>
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
        {options.map(o => (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${
              value === o.value ? 'bg-blue-600 text-white' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
