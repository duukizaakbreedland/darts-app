import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect, PlayersSummary } from '../components/CpuLevelSelect'
import { useParticipants } from '../context/Participants'
import type { AtcHitMode } from '../hooks/useAroundTheClock'

type Order = 'desc' | 'asc' | 'random'
type End = 'none' | 'bull' | 'bullseye'

function Segmented<T extends string | number | boolean>({
  label, options, value, onChange,
}: {
  label: string
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
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

export function AtcSetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [order, setOrder] = useState<Order>('asc')
  const [hitMode, setHitMode] = useState<AtcHitMode>('all')
  const [hitsRequired, setHitsRequired] = useState(1)
  const [increaseBySegment, setIncreaseBySegment] = useState(false)
  const [end, setEnd] = useState<End>('none')

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/atc/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        order,
        hitMode,
        hitsRequired,
        increaseBySegment,
        end,
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

      <PlayersSummary />
      <CpuLevelSelect />

      <Segmented<Order>
        label="Volgorde"
        value={order}
        onChange={setOrder}
        options={[
          { label: '1 → 20', value: 'asc' },
          { label: '20 → 1', value: 'desc' },
          { label: 'Willekeurig', value: 'random' },
        ]}
      />

      <Segmented<AtcHitMode>
        label="Mikken op"
        value={hitMode}
        onChange={setHitMode}
        options={[
          { label: 'Alles', value: 'all' },
          { label: 'Single', value: 'single' },
          { label: 'Double', value: 'double' },
          { label: 'Triple', value: 'triple' },
        ]}
      />

      <Segmented<boolean>
        label="Vooruit per segment"
        value={increaseBySegment}
        onChange={setIncreaseBySegment}
        options={[
          { label: 'Uit', value: false },
          { label: 'Aan', value: true },
        ]}
      />

      {!increaseBySegment && (
        <Segmented<number>
          label="Aantal keer raken"
          value={hitsRequired}
          onChange={setHitsRequired}
          options={[
            { label: '1×', value: 1 },
            { label: '2×', value: 2 },
            { label: '3×', value: 3 },
          ]}
        />
      )}

      <Segmented<End>
        label="Eindigen op"
        value={end}
        onChange={setEnd}
        options={[
          { label: '20', value: 'none' },
          { label: 'Bull', value: 'bull' },
          { label: 'Bullseye', value: 'bullseye' },
        ]}
      />

      {/* Starten */}
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
