import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { Segmented } from '../components/Segmented'
import { useParticipants } from '../context/Participants'

export function CricketSetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [scoring, setScoring] = useState(true)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/cricket/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        scoring,
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

      <Segmented<boolean>
        label="Puntentelling"
        value={scoring}
        onChange={setScoring}
        options={[
          { label: 'Met punten', value: true },
          { label: 'Alleen sluiten', value: false },
        ]}
      />

      <p className="text-sm text-slate-500 -mt-2">
        Sluit 15 t/m 20 en de bull door elk 3× te raken. {scoring
          ? 'Op een gesloten nummer dat je tegenstander nog niet dicht heeft, scoor je punten. Wie alles sluit én voorstaat, wint.'
          : 'Wie als eerste alles sluit, wint.'}
      </p>

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
