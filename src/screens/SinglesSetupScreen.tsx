import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { Segmented } from '../components/Segmented'
import { useParticipants } from '../context/Participants'

type Order = 'asc' | 'random'

export function SinglesSetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [order, setOrder] = useState<Order>('asc')
  const [includeBull, setIncludeBull] = useState(false)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/singles/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        order,
        includeBull,
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
          Singles Training
        </h1>
      </div>

      <CpuLevelSelect />

      <Segmented<Order>
        label="Volgorde"
        value={order}
        onChange={setOrder}
        options={[
          { label: '1 → 20', value: 'asc' },
          { label: 'Willekeurig', value: 'random' },
        ]}
      />

      <Segmented<boolean>
        label="Bull meenemen"
        value={includeBull}
        onChange={setIncludeBull}
        options={[
          { label: 'Nee', value: false },
          { label: 'Ja', value: true },
        ]}
      />

      <p className="text-sm text-slate-500 -mt-2">
        Elke ronde mik je op de single van een nummer. Je schuift altijd door — raak of niet. Elke treffer is 1 punt. Na alle nummers wint de hoogste score.
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
