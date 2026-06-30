import { useEffect, useState } from 'react'
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
import { OnScreenKeyboard } from './OnScreenKeyboard'
import { fetchPlayers, createPlayer, isDuplicateError } from '../lib/players'
import { CPU_LEVELS, cpuTargetAverage } from '../lib/cpu'
import type { Player } from '../types/database'

const MAX_PLAYERS = 4
const PROFILES_CACHE = 'darts.profilesCache'
const CPU_ID = 'cpu'

// Deelnemer: profiel (cpuLevel = null) of de computer (cpuLevel = 1-10)
export type Slot = { id: string; name: string; cpuLevel: number | null }

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

type RowProps = { slot: Slot; index: number; onRemove: () => void }

function SortablePlayerRow({ slot, index, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const isCpu = slot.cpuLevel != null

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
      <div
        className={`flex-1 border rounded-xl px-4 h-12 flex items-center ${
          isCpu ? 'bg-blue-950/40 border-blue-800/50 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-100'
        }`}
      >
        {slot.name}
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

interface PlayerSelectProps {
  /** Wordt aangeroepen bij elke wijziging met de huidige deelnemers (in volgorde). */
  onChange: (slots: Slot[]) => void
}

export function PlayerSelect({ onChange }: PlayerSelectProps) {
  const [profiles, setProfiles] = useState<Player[]>(() => loadCachedProfiles())
  const [selected, setSelected] = useState<Slot[]>(() => {
    const me = findMe(loadCachedProfiles())
    return me ? [{ id: me.id, name: me.name, cpuLevel: null }] : []
  })
  const [loading, setLoading] = useState(() => loadCachedProfiles().length === 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    onChange(selected)
  }, [selected, onChange])

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
  const cpuLevel = selected.find(s => s.cpuLevel != null)?.cpuLevel ?? 1
  const pickable = profiles.filter(p => !selected.some(s => s.id === p.id))

  const addProfile = (p: Player) => {
    setSelected(prev => [...prev, { id: p.id, name: p.name, cpuLevel: null }])
    setShowPicker(false)
  }
  const addComputer = () => {
    setSelected(prev => [...prev, { id: CPU_ID, name: 'Computer', cpuLevel: 1 }])
    setShowPicker(false)
  }
  const setCpuLevel = (level: number) => {
    const clamped = Math.min(CPU_LEVELS, Math.max(1, level))
    setSelected(prev => prev.map(s => (s.cpuLevel != null ? { ...s, cpuLevel: clamped } : s)))
  }
  const removeSlot = (id: string) => setSelected(prev => prev.filter(s => s.id !== id))

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

  return (
    <>
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
                  <SortablePlayerRow key={slot.id} slot={slot} index={i} onRemove={() => removeSlot(slot.id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {selected.length < MAX_PLAYERS && (
          <button
            onClick={() => setShowPicker(true)}
            className="h-12 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm hover:border-slate-500 hover:text-slate-300 active:bg-slate-800 transition-colors"
          >
            + Speler toevoegen
          </button>
        )}
      </div>

      {/* Computer-niveau */}
      {hasCpu && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Computer-niveau</span>
            <span className="text-[11px] text-slate-500">~{cpuTargetAverage(cpuLevel)} gem.</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: CPU_LEVELS }, (_, i) => i + 1).map(lvl => (
              <button
                key={lvl}
                onClick={() => setCpuLevel(lvl)}
                className={`flex-1 h-12 rounded-lg text-base font-bold transition-colors ${
                  cpuLevel === lvl
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 active:bg-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kiezer-modal */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm flex flex-col max-h-[80svh] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-slate-100 font-bold text-lg">Speler toevoegen</h2>
              <button onClick={() => setShowPicker(false)} className="text-slate-500 text-xl">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-3 flex flex-col gap-2">
              {!hasCpu && (
                <button
                  onClick={addComputer}
                  className="flex items-center justify-between bg-blue-950/40 border border-blue-800/50 rounded-xl px-4 h-14 active:bg-blue-900/40 transition-colors"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-blue-200 font-semibold">Computer</span>
                    <span className="text-[11px] text-slate-500">Speel tegen de computer</span>
                  </div>
                  <span className="text-blue-400 text-lg">›</span>
                </button>
              )}

              {pickable.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProfile(p)}
                  className="flex items-center justify-between bg-slate-700/50 border border-slate-700 rounded-xl px-4 h-14 text-slate-100 font-medium active:bg-slate-700 transition-colors"
                >
                  {p.name}
                  <span className="text-slate-500 text-lg">›</span>
                </button>
              ))}

              {loading && <p className="text-slate-500 text-sm text-center py-2">Profielen laden…</p>}

              <button
                onClick={() => {
                  setShowPicker(false)
                  setCreating(true)
                }}
                disabled={busy}
                className="h-12 rounded-xl border border-dashed border-slate-600 text-slate-400 text-sm active:bg-slate-700/50 transition-colors"
              >
                + Nieuw profiel
              </button>
            </div>
          </div>
        </div>
      )}

      {creating && <OnScreenKeyboard label="Nieuw profiel" initialValue="" onClose={handleCreateProfile} />}
    </>
  )
}
