import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { useParticipants } from '../context/Participants'

const STARTING_SCORES = [301, 501, 701]

export function NewGameScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [startingScore, setStartingScore] = useState(501)
  const [legs, setLegs] = useState(1)
  const [sets, setSets] = useState(1)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/game', {
      state: {
        startingScore, legs, sets,
        players: participants.map(s => s.name),
        playerIds: participants.map(s => (s.cpuLevel != null ? null : s.id)),
        cpuLevels: participants.map(s => s.cpuLevel),
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
          Nieuw spel
        </h1>
      </div>

      <CpuLevelSelect />

      {/* Score */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Score</span>
        <div className="flex gap-2">
          {STARTING_SCORES.map(s => (
            <button
              key={s}
              onClick={() => setStartingScore(s)}
              className={`flex-1 h-12 rounded-xl font-bold text-lg transition-colors ${
                startingScore === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Legs & Sets */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Legs', value: legs, set: setLegs, min: 1, max: 9, step: 2 },
          { label: 'Sets', value: sets, set: setSets, min: 1, max: 7, step: 2 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">{label}</span>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => set(v => Math.max(min, v - step))}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
              >
                −
              </button>
              <span className="flex-1 text-center text-xl font-bold text-slate-100">{value}</span>
              <button
                onClick={() => set(v => Math.min(max, v + step))}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spel starten */}
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
