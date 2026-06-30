import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerSelect, type Slot } from '../components/PlayerSelect'

export function AtcSetupScreen() {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState<Slot[]>([])
  const [endOnBull, setEndOnBull] = useState(false)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/atc/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        endOnBull,
      },
    })
  }

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-5 gap-6 pt-[calc(env(safe-area-inset-top)_+_0.5rem)]">
      {/* Header */}
      <div className="relative flex items-center h-11">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 h-11 px-3 -ml-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
        >
          <span className="text-2xl leading-none">‹</span>
          <span className="text-sm font-medium">Terug</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-100 pointer-events-none">
          Around the Clock
        </h1>
      </div>

      <PlayerSelect onChange={setParticipants} />

      {/* Eindigen op */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Eindigen op</span>
        <div className="grid grid-cols-2 gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          {[
            { label: '20', bull: false },
            { label: 'Bull', bull: true },
          ].map(o => (
            <button
              key={o.label}
              onClick={() => setEndOnBull(o.bull)}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                endOnBull === o.bull ? 'bg-blue-600 text-white' : 'text-slate-400 active:text-slate-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Starten */}
      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full h-16 rounded-xl text-xl font-bold transition-all ${
            canStart
              ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-900/40'
              : 'bg-slate-800 border border-slate-700 text-slate-700 cursor-not-allowed'
          }`}
        >
          Spel starten
        </button>
      </div>
    </div>
  )
}
