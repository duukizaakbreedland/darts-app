import { useNavigate } from 'react-router-dom'

interface GameHeaderProps {
  title: string
  backTo: string
  canUndo: boolean
  onUndo: () => void
}

export function GameHeader({ title, backTo, canUndo, onUndo }: GameHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="relative flex items-center justify-center h-14 px-2 border-b border-slate-800">
      <button
        onClick={() => navigate(backTo)}
        className="absolute left-1 flex items-center gap-1 h-11 px-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
      >
        <span className="text-2xl leading-none">‹</span>
        <span className="text-sm font-medium">Terug</span>
      </button>
      <div className="text-sm font-bold text-slate-200">{title}</div>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Ongedaan maken"
        className={`absolute right-1 w-11 h-11 flex items-center justify-center rounded-lg text-xl transition-colors ${
          canUndo ? 'text-slate-300 active:bg-slate-800' : 'text-slate-700 cursor-not-allowed'
        }`}
      >
        ↩
      </button>
    </div>
  )
}
