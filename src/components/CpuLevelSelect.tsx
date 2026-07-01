import { useParticipants } from '../context/Participants'
import { CPU_LEVELS, cpuTargetAverage } from '../lib/cpu'

/** Computer-niveau (1-10), alleen zichtbaar als de computer meespeelt. */
export function CpuLevelSelect() {
  const { participants, setParticipants } = useParticipants()
  const cpu = participants.find(s => s.cpuLevel != null)
  if (!cpu) return null
  const level = cpu.cpuLevel ?? 1

  const setLevel = (lvl: number) => {
    const clamped = Math.min(CPU_LEVELS, Math.max(1, lvl))
    setParticipants(participants.map(s => (s.cpuLevel != null ? { ...s, cpuLevel: clamped } : s)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Computer-niveau</span>
        <span className="text-[11px] text-slate-500">~{cpuTargetAverage(level)} gem.</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: CPU_LEVELS }, (_, i) => i + 1).map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`flex-1 h-12 rounded-lg text-base font-bold transition-colors ${
              level === lvl
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-400 active:bg-slate-700'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Compacte, niet-bewerkbare samenvatting van wie er meespeelt. */
export function PlayersSummary() {
  const { participants } = useParticipants()
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Spelers</span>
      {participants.length >= 2 ? (
        <div className="flex flex-wrap gap-2">
          {participants.map((s, i) => (
            <span
              key={s.id}
              className={`h-9 px-3 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                s.cpuLevel != null
                  ? 'bg-blue-950/40 border border-blue-800/50 text-blue-200'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-slate-500 text-xs">{i + 1}</span>
              {s.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Kies minstens twee spelers op het home-scherm.</p>
      )}
    </div>
  )
}
