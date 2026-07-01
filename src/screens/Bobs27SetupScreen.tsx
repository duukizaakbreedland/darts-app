import { useNavigate } from 'react-router-dom'
import { CpuLevelSelect } from '../components/CpuLevelSelect'
import { useParticipants } from '../context/Participants'

export function Bobs27SetupScreen() {
  const navigate = useNavigate()
  const { participants } = useParticipants()
  const canStart = participants.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/training/bobs27/play', {
      state: {
        players: participants.map(s => s.name),
        cpuLevels: participants.map(s => s.cpuLevel),
        playerIds: participants.map(s => (s.cpuLevel != null ? null : s.id)),
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
          Bob's 27
        </h1>
      </div>

      <CpuLevelSelect />

      <p className="text-sm text-slate-500">
        Je start op <span className="text-slate-300 font-semibold">27</span> punten en gooit 3 darts op double 1, dan double 2, … tot de bull. Elke treffer telt de dubbelwaarde bij op; mis je alle drie, dan gaat die waarde eraf. Zak je onder nul, dan lig je eruit. De hoogste eindscore wint.
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
