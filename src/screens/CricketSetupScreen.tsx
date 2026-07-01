import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { Segmented } from '../components/Segmented'
import { useParticipants } from '../context/Participants'

type Variant = 'standard' | 'tactics'

export function CricketSetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [variant, setVariant] = useState<Variant>('standard')
  const [scoring, setScoring] = useState(true)
  const [legs, setLegs] = useState(1)
  const [sets, setSets] = useState(1)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/cricket/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        variant,
        scoring,
        legs,
        sets,
      },
    })
  }

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-5 gap-6 pt-[calc(env(safe-area-inset-top)_+_0.5rem)]">
      <div className="relative flex items-center h-11">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 h-11 px-3 -ml-3 rounded-lg text-slate-300 active:bg-slate-800 transition-colors"
        >
          <span className="text-2xl leading-none">‹</span>
          <span className="text-sm font-medium">Terug</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-100 pointer-events-none">
          Cricket
        </h1>
      </div>

      <CpuLevelSelect />

      <Segmented<Variant>
        label="Variant"
        value={variant}
        onChange={setVariant}
        options={[
          { label: 'Standaard (15-20)', value: 'standard' },
          { label: 'Tactics (10-20)', value: 'tactics' },
        ]}
      />

      <Segmented<boolean>
        label="Puntentelling"
        value={scoring}
        onChange={setScoring}
        options={[
          { label: 'Met punten', value: true },
          { label: 'Alleen sluiten', value: false },
        ]}
      />

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

      <div className="mt-auto pt-2">
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
