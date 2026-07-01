import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { Segmented } from '../components/Segmented'
import { useParticipants } from '../context/Participants'
import { generateCheckouts, type CheckoutRange } from '../hooks/useCheckout'

export function CheckoutSetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const [range, setRange] = useState<CheckoutRange>('all')
  const [target, setTarget] = useState(5)

  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/checkout/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        playerIds: participants.map(s => (s.cpuLevel != null ? null : s.id)),
        range,
        target,
        seed: generateCheckouts(range, target * participants.length + 20),
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
          Checkout
        </h1>
      </div>

      <CpuLevelSelect />

      <Segmented<CheckoutRange>
        label="Moeilijkheid"
        value={range}
        onChange={setRange}
        options={[
          { label: 'Alles', value: 'all' },
          { label: '2-60', value: 'easy' },
          { label: '61-120', value: 'medium' },
          { label: '121-170', value: 'hard' },
        ]}
      />

      <Segmented<number>
        label="Eerste tot"
        value={target}
        onChange={setTarget}
        options={[
          { label: '3', value: 3 },
          { label: '5', value: 5 },
          { label: '10', value: 10 },
        ]}
      />

      <p className="text-sm text-slate-500 -mt-2">
        Je krijgt om de beurt een finish aangeboden. Geef aan of je 'm gooit en in hoeveel darts. Wie als eerste {target} finishes haalt, wint.
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
