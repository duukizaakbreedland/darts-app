import { useState } from 'react'
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

const STARTING_SCORES = [301, 501, 701]
const RECENT_KEY = 'darts.recentPlayers'

let idCounter = 0
const uid = () => `p${idCounter++}`

type PlayerSlot = { id: string; name: string }

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

type RowProps = {
  player: PlayerSlot
  index: number
  total: number
  isActive: boolean
  onEdit: () => void
  onRemove: () => void
}

function SortablePlayerRow({ player, index, total, isActive, onEdit, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? 'relative z-10 opacity-80' : ''}`}
    >
      {/* Sleep-handvat */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Versleep om volgorde te wijzigen"
        className="w-8 h-12 flex items-center justify-center text-slate-600 text-xl touch-none cursor-grab active:cursor-grabbing active:text-slate-400"
      >
        ⠿
      </button>

      {/* Volgordenummer */}
      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
        {index + 1}
      </div>

      {/* Naam */}
      <button
        onClick={onEdit}
        className={`flex-1 text-left bg-slate-800 border rounded-xl px-4 h-12 transition-colors ${
          isActive ? 'border-blue-500' : 'border-slate-700'
        } ${player.name ? 'text-slate-100' : 'text-slate-600'}`}
      >
        {player.name || `Speler ${index + 1}`}
      </button>

      {/* Verwijderen */}
      {total > 1 && (
        <button
          onClick={onRemove}
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center active:bg-slate-700"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export function NewGameScreen() {
  const navigate = useNavigate()
  const [startingScore, setStartingScore] = useState(501)
  const [legs, setLegs] = useState(3)
  const [sets, setSets] = useState(1)
  const [players, setPlayers] = useState<PlayerSlot[]>([
    { id: uid(), name: 'Duuk' },
    { id: uid(), name: '' },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [recent] = useState<string[]>(loadRecent)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPlayers(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id)
        const newIndex = prev.findIndex(p => p.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const addPlayer = () => {
    if (players.length >= 4) return
    const slot = { id: uid(), name: '' }
    setPlayers([...players, slot])
    setActiveId(slot.id) // toetsenbord meteen openen voor de nieuwe speler
  }

  const updateName = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, name } : p)))
  }

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const fillFromRecent = (name: string) => {
    if (players.some(p => p.name.trim().toLowerCase() === name.toLowerCase())) return
    const empty = players.find(p => !p.name.trim())
    if (empty) updateName(empty.id, name)
    else if (players.length < 4) setPlayers([...players, { id: uid(), name }])
  }

  const availableRecent = recent.filter(
    r => !players.some(p => p.name.trim().toLowerCase() === r.toLowerCase())
  )

  const canStart = players.filter(p => p.name.trim()).length >= 2

  const handleStart = () => {
    const validPlayers = players.map(p => p.name.trim()).filter(Boolean)
    const merged = [
      ...validPlayers,
      ...recent.filter(r => !validPlayers.some(n => n.toLowerCase() === r.toLowerCase())),
    ].slice(0, 8)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(merged))
    } catch {
      /* opslag niet beschikbaar — niet erg */
    }
    navigate('/game', { state: { startingScore, legs, sets, players: validPlayers } })
  }

  const activeIndex = activeId ? players.findIndex(p => p.id === activeId) : -1

  return (
    <div className="flex flex-col min-h-svh bg-slate-900 px-5 pb-5 gap-6 pt-[calc(env(safe-area-inset-top)_+_0.5rem)]">
      {/* Header: terug + gecentreerde titel */}
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

      {/* Spelers — bovenaan, sleepbaar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Spelers</span>
          <span className="text-[11px] text-slate-600">⠿ sleep · nr. 1 begint</span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={players.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {players.map((player, i) => (
                <SortablePlayerRow
                  key={player.id}
                  player={player}
                  index={i}
                  total={players.length}
                  isActive={activeId === player.id}
                  onEdit={() => setActiveId(player.id)}
                  onRemove={() => removePlayer(player.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {players.length < 4 && (
          <button
            onClick={addPlayer}
            className="h-12 rounded-xl border border-dashed border-slate-700 text-slate-600 text-sm hover:border-slate-500 hover:text-slate-400 transition-colors"
          >
            + Speler toevoegen
          </button>
        )}

        {/* Recente spelers — snelkeuze */}
        {availableRecent.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {availableRecent.map(name => (
              <button
                key={name}
                onClick={() => fillFromRecent(name)}
                className="h-8 px-3 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm active:bg-slate-700 transition-colors"
              >
                + {name}
              </button>
            ))}
          </div>
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

      {activeId !== null && activeIndex >= 0 && (
        <OnScreenKeyboard
          label={`Speler ${activeIndex + 1}`}
          initialValue={players[activeIndex].name}
          onClose={value => {
            updateName(activeId, value)
            setActiveId(null)
          }}
        />
      )}
    </div>
  )
}
