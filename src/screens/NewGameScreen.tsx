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

type Mode = 'humans' | 'computer'

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

type RowProps = { player: Player; index: number; onRemove: () => void }

function SortablePlayerRow({ player, index, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  })
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
        {player.name}
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
  const [mode, setMode] = useState<Mode>('humans')

  // Init uit lokale cache zodat het scherm meteen met Duuk gevuld is
  const [profiles, setProfiles] = useState<Player[]>(() => loadCachedProfiles())
  const [selected, setSelected] = useState<Player[]>(() => {
    const me = findMe(loadCachedProfiles())
    return me ? [me] : []
  })
  const [you, setYou] = useState<Player | null>(() => findMe(loadCachedProfiles()) ?? null)
  const [cpuLevel, setCpuLevel] = useState(5)
  const [cpuStarts, setCpuStarts] = useState(false)

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
        const me = findMe(list)
        setSelected(prev => (prev.length > 0 ? prev : me ? [me] : prev))
        setYou(prev => prev ?? me ?? null)
      })
      .catch(() => setError('Kon profielen niet laden. Controleer je internetverbinding.'))
      .finally(() => setLoading(false))
  }, [])

  const available = profiles.filter(p => !selected.some(s => s.id === p.id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSelected(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id)
        const newIndex = prev.findIndex(p => p.id === over.id)
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
      if (mode === 'humans') {
        setSelected(prev => (prev.length < MAX_PLAYERS ? [...prev, player] : prev))
      } else {
        setYou(player)
      }
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

  const canStart = mode === 'humans' ? selected.length >= 2 : you !== null

  const handleStart = () => {
    if (!canStart) return
    if (mode === 'humans') {
      navigate('/game', {
        state: {
          startingScore, legs, sets,
          players: selected.map(p => p.name),
          playerIds: selected.map(p => p.id),
          cpuLevels: selected.map(() => null),
        },
      })
    } else {
      const human = { name: you!.name, id: you!.id, cpu: null as number | null }
      const cpu = { name: 'Computer', id: 'cpu', cpu: cpuLevel }
      const order = cpuStarts ? [cpu, human] : [human, cpu]
      navigate('/game', {
        state: {
          startingScore, legs, sets,
          players: order.map(p => p.name),
          playerIds: order.map(p => (p.cpu != null ? null : p.id)),
          cpuLevels: order.map(p => p.cpu),
        },
      })
    }
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

      {/* Tegenstander-type */}
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Tegenstander</span>
        <div className="grid grid-cols-2 gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          {(['humans', 'computer'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'text-slate-400 active:text-slate-200'
              }`}
            >
              {m === 'humans' ? 'Mensen' : 'Computer'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm py-2">Profielen laden…</p>
      ) : mode === 'humans' ? (
        /* ─── Mensen: 2-4 profielen, sleepbaar ─── */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Spelers</span>
            {selected.length > 1 && <span className="text-[11px] text-slate-600">⠿ sleep · nr. 1 begint</span>}
          </div>

          {selected.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={selected.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {selected.map((player, i) => (
                    <SortablePlayerRow
                      key={player.id}
                      player={player}
                      index={i}
                      onRemove={() => setSelected(selected.filter(p => p.id !== player.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {selected.length < MAX_PLAYERS && (
            <div className="flex flex-wrap gap-2">
              {available.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected([...selected, p])}
                  className="h-10 px-4 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium active:bg-slate-700 transition-colors"
                >
                  + {p.name}
                </button>
              ))}
              <button
                onClick={() => setCreating(true)}
                disabled={busy}
                className="h-10 px-4 rounded-full border border-dashed border-slate-600 text-slate-400 text-sm active:bg-slate-800 transition-colors"
              >
                + Nieuw profiel
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ─── Computer: jij + niveau + wie begint ─── */
        <>
          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Jij</span>
            <div className="flex flex-wrap gap-2">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => setYou(p)}
                  className={`h-10 px-4 rounded-full border text-sm font-medium transition-colors ${
                    you?.id === p.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-200 active:bg-slate-700'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => setCreating(true)}
                disabled={busy}
                className="h-10 px-4 rounded-full border border-dashed border-slate-600 text-slate-400 text-sm active:bg-slate-800 transition-colors"
              >
                + Nieuw profiel
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Computer-niveau</span>
            <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-1 h-12">
              <span className="text-[11px] text-slate-500">~{cpuTargetAverage(cpuLevel)} gemiddeld</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCpuLevel(v => Math.max(1, v - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-bold text-slate-100">{cpuLevel}</span>
                <button
                  onClick={() => setCpuLevel(v => Math.min(CPU_LEVELS, v + 1))}
                  className="w-10 h-10 rounded-lg bg-slate-700 text-slate-200 text-xl font-bold flex items-center justify-center active:bg-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Wie begint</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
              {[
                { label: 'Jij', cpu: false },
                { label: 'Computer', cpu: true },
              ].map(o => (
                <button
                  key={o.label}
                  onClick={() => setCpuStarts(o.cpu)}
                  className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                    cpuStarts === o.cpu ? 'bg-blue-600 text-white' : 'text-slate-400 active:text-slate-200'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

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
