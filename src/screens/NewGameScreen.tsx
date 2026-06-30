import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { OnScreenKeyboard } from '../components/OnScreenKeyboard'
import { fetchPlayers, createPlayer, isDuplicateError } from '../lib/players'
import { CPU_LEVELS, cpuTargetAverage } from '../lib/cpu'
import type { Player } from '../types/database'

const STARTING_SCORES = [301, 501, 701]
const MAX_PLAYERS = 4
const PROFILES_CACHE = 'darts.profilesCache'
const CPU_ID = 'cpu'

// Een deelnemer is een profiel (cpuLevel = null) of de computer (cpuLevel = 1-10)
type Slot = { id: string; name: string; cpuLevel: number | null }

function loadCachedProfiles(): Player[] {
  try {
    const raw = localStorage.getItem(PROFILES_CACHE)
    return raw ? (JSON.parse(raw) as Player[]) : []
  } catch {
    return []
  }
}

function findMe(list: Player[]): Player | undefined {
  return list.find(p => p.name.trim().toLowerCase() === 'duuk')
}

function slotLabel(s: Slot): string {
  return s.cpuLevel != null ? `Computer · niv. ${s.cpuLevel}` : s.name
}

type RowProps = {
  id: string
  label: string
  index: number
  onRemove: () => void
}

function SortablePlayerRow({ id, label, index, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? 'relative z-10 opacity-80' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Versleep om volgorde te wijzigen"
        className="w-8 h-12 flex items-center justify-center text-slate-600 text-xl touch-none cursor-grab active:cursor-grabbing active:text-slate-400"
      >
        ⠿
      </button>
      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 flex items-center text-slate-100">
        {label}
      </div>
      <button
        onClick={onRemove}
        className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center active:bg-slate-700"
      >
        ✕
      </button>
    </div>
  )
}

export function NewGameScreen() {
  const navigate = useNavigate()
  const [startingScore, setStartingScore] = useState(501)
  const [legs, setLegs] = useState(3)
  const [sets, setSets] = useState(1)

  // Init uit lokale cache, zodat het scherm meteen mét Duuk geselecteerd verschijnt
  const [profiles, setProfiles] = useState<Player[]>(() => loadCachedProfiles())
  const [selected, setSelected] = useState<Slot[]>(() => {
    const me = findMe(loadCachedProfiles())
    return me ? [{ id: me.id, name: me.name, cpuLevel: null }] : []
  })
  const [loading, setLoading] = useState(() => loadCachedProfiles().length === 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    fetchPlayers()
      .then(list => {
        setProfiles(list)
        localStorage.setItem(PROFILES_CACHE, JSON.stringify(list))
        setSelected(prev => {
          if (prev.length > 0) return prev
          const me = findMe(list)
          return me ? [{ id: me.id, name: me.name, cpuLevel: null }] : prev
        })
      })
      .catch(() => setError('Kon profielen niet laden. Controleer je internetverbinding.'))
      .finally(() => setLoading(false))
  }, [])

  const hasCpu = selected.some(s => s.cpuLevel != null)
  const cpuLevel = selected.find(s => s.cpuLevel != null)?.cpuLevel ?? 5
  const available = profiles.filter(p => !selected.some(s => s.id === p.id))

  const addProfile = (p: Player) => {
    if (selected.length >= MAX_PLAYERS) return
    setSelected([...selected, { id: p.id, name: p.name, cpuLevel: null }])
  }

  const addCpu = () => {
    if (selected.length >= MAX_PLAYERS || hasCpu) return
    setSelected([...selected, { id: CPU_ID, name: 'Computer', cpuLevel: 5 }])
  }

  const setCpuLevel = (level: number) => {
    const clamped = Math.min(CPU_LEVELS, Math.max(1, level))
    setSelected(prev => prev.map(s => (s.cpuLevel != null ? { ...s, cpuLevel: clamped } : s)))
  }

  const removeSelected = (id: string) => {
    setSelected(selected.filter(s => s.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSelected(prev => {
        const oldIndex = prev.findIndex(s => s.id === active.id)
        const newIndex = prev.findIndex(s => s.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleCreateProfile = async (value: string) => {
    setCreating(false)
    const name = value.trim()
    if (!name) return
    setBusy(true)
    setError(null)
    try {
      const player = await createPlayer(name)
      setProfiles(prev => {
        const next = [...prev, player].sort((a, b) => a.name.localeCompare(b.name))
        localStorage.setItem(PROFILES_CACHE, JSON.stringify(next))
        return next
      })
      setSelected(prev =>
        prev.length < MAX_PLAYERS ? [...prev, { id: player.id, name: player.name, cpuLevel: null }] : prev
      )
    } catch (e) {
      setError(
        isDuplicateError(e)
          ? `Er bestaat al een profiel met de naam "${name}".`
          : 'Profiel aanmaken mislukt. Probeer het opnieuw.'
      )
    } finally {
      setBusy(false)
    }
  }

  const canStart = selected.length >= 2

  const handleStart = () => {
    if (!canStart) return
    navigate('/game', {
      state: {
        startingScore,
        legs,
        sets,
        players: selected.map(s => s.name),
        playerIds: selected.map(s => (s.cpuLevel != null ? null : s.id)),
        cpuLevels: selected.map(s => s.cpuLevel),
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

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Spelers */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Spelers</span>
          {selected.length > 1 && <span className="text-[11px] text-slate-600">⠿ sleep · nr. 1 begint</span>}
        </div>

        {/* Geselecteerde deelnemers (sleepbaar) */}
        {selected.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={selected.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {selected.map((slot, i) => (
                  <SortablePlayerRow
                    key={slot.id}
                    id={slot.id}
                    label={slotLabel(slot)}
                    index={i}
                    onRemove={() => removeSelected(slot.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Computer-niveau */}
        {hasCpu && (
          <div className="flex items-center justify-between bg-slate-800/50 border border-slate-800 rounded-xl pl-4 pr-1 h-12">
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-slate-300">Computer-niveau</span>
              <span className="text-[11px] text-slate-600">~{cpuTargetAverage(cpuLevel)} gemiddeld</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCpuLevel(cpuLevel - 1)}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
              >
                −
              </button>
              <span className="w-8 text-center text-lg font-bold text-slate-100">{cpuLevel}</span>
              <button
                onClick={() => setCpuLevel(cpuLevel + 1)}
                className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Kies uit profielen / computer */}
        {loading ? (
          <p className="text-slate-500 text-sm py-2">Profielen laden…</p>
        ) : (
          <>
            {selected.length === 0 && (
              <p className="text-slate-500 text-sm">Kies minimaal twee spelers:</p>
            )}
            {selected.length < MAX_PLAYERS && (
              <div className="flex flex-wrap gap-2">
                {available.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addProfile(p)}
                    className="h-10 px-4 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium active:bg-slate-700 transition-colors"
                  >
                    + {p.name}
                  </button>
                ))}
                {!hasCpu && (
                  <button
                    onClick={addCpu}
                    className="h-10 px-4 rounded-full bg-slate-800 border border-slate-700 text-blue-300 text-sm font-medium active:bg-slate-700 transition-colors"
                  >
                    + Computer
                  </button>
                )}
                <button
                  onClick={() => setCreating(true)}
                  disabled={busy}
                  className="h-10 px-4 rounded-full border border-dashed border-slate-600 text-slate-400 text-sm active:bg-slate-800 transition-colors"
                >
                  + Nieuw profiel
                </button>
              </div>
            )}
            {selected.length >= MAX_PLAYERS && (
              <span className="text-xs text-slate-600">Maximaal {MAX_PLAYERS} spelers.</span>
            )}
          </>
        )}
      </div>

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

      {creating && (
        <OnScreenKeyboard label="Nieuw profiel" initialValue="" onClose={handleCreateProfile} />
      )}
    </div>
  )
}
