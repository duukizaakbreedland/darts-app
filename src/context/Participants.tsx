import { createContext, useContext, useState, type ReactNode } from 'react'

// Een deelnemer: profiel (cpuLevel = null) of de computer (cpuLevel = 1-10)
export type Slot = { id: string; name: string; cpuLevel: number | null }

const KEY = 'darts.participants'
const PROFILES_CACHE = 'darts.profilesCache'

function loadInitial(): Slot[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Slot[]
  } catch {
    /* val terug */
  }
  // Eerste keer: Duuk uit de profiel-cache voorselecteren
  try {
    const praw = localStorage.getItem(PROFILES_CACHE)
    if (praw) {
      const profs = JSON.parse(praw) as { id: string; name: string }[]
      const me = profs.find(p => p.name.trim().toLowerCase() === 'duuk')
      if (me) return [{ id: me.id, name: me.name, cpuLevel: null }]
    }
  } catch {
    /* niets */
  }
  return []
}

interface Ctx {
  participants: Slot[]
  setParticipants: (slots: Slot[]) => void
}

const ParticipantsCtx = createContext<Ctx | null>(null)

export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const [participants, setState] = useState<Slot[]>(loadInitial)

  const setParticipants = (slots: Slot[]) => {
    setState(slots)
    try {
      localStorage.setItem(KEY, JSON.stringify(slots))
    } catch {
      /* opslag niet beschikbaar */
    }
  }

  return (
    <ParticipantsCtx.Provider value={{ participants, setParticipants }}>{children}</ParticipantsCtx.Provider>
  )
}

export function useParticipants(): Ctx {
  const ctx = useContext(ParticipantsCtx)
  if (!ctx) throw new Error('useParticipants moet binnen ParticipantsProvider gebruikt worden')
  return ctx
}
