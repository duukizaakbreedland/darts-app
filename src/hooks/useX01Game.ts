import { useReducer } from 'react'

export interface GameConfig {
  players: string[]
  startingScore: number
  legsToWin: number // legs nodig om een set te winnen
  setsToWin: number // sets nodig om de match te winnen
}

export interface Visit {
  player: number
  points: number
  darts: number
  remainingBefore: number
  remainingAfter: number
  bust: boolean
  checkout: boolean
  double?: string
  leg: number
  set: number
}

interface CoreState {
  scores: number[]
  legsWon: number[]
  setsWon: number[]
  activePlayer: number
  legStarter: number
  currentLeg: number
  currentSet: number
  visits: Visit[]
  winner: number | null
}

interface GameState {
  past: CoreState[]
  present: CoreState
}

export type SubmitPayload = {
  points: number
  darts: number
  checkout: boolean
  double?: string
}

type Action =
  | { type: 'submit'; payload: SubmitPayload }
  | { type: 'undo' }

function initCore(config: GameConfig): CoreState {
  return {
    scores: config.players.map(() => config.startingScore),
    legsWon: config.players.map(() => 0),
    setsWon: config.players.map(() => 0),
    activePlayer: 0,
    legStarter: 0,
    currentLeg: 1,
    currentSet: 1,
    visits: [],
    winner: null,
  }
}

function reducer(config: GameConfig): (state: GameState, action: Action) => GameState {
  const n = config.players.length

  return (state, action) => {
    if (action.type === 'undo') {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return { past: state.past.slice(0, -1), present: previous }
    }

    // submit
    const p = state.present
    if (p.winner !== null) return state

    const active = p.activePlayer
    const before = p.scores[active]
    const { points, darts, checkout, double } = action.payload
    const remaining = before - points

    // Bust: te ver, op 1 blijven, of 0 zonder geldige checkout
    const isBust =
      remaining < 0 || remaining === 1 || (remaining === 0 && !checkout)

    const visit: Visit = {
      player: active,
      points: isBust ? 0 : points,
      darts,
      remainingBefore: before,
      remainingAfter: isBust ? before : remaining,
      bust: isBust,
      checkout: checkout && !isBust,
      double: checkout && !isBust ? double : undefined,
      leg: p.currentLeg,
      set: p.currentSet,
    }

    const next: CoreState = {
      ...p,
      scores: [...p.scores],
      legsWon: [...p.legsWon],
      setsWon: [...p.setsWon],
      visits: [...p.visits, visit],
    }

    if (visit.checkout) {
      // Leg gewonnen
      next.legsWon[active] += 1

      if (next.legsWon[active] >= config.legsToWin) {
        // Set gewonnen
        next.setsWon[active] += 1
        next.legsWon = config.players.map(() => 0)

        if (next.setsWon[active] >= config.setsToWin) {
          next.winner = active
          next.scores[active] = 0
          return { past: [...state.past, p], present: next }
        }
        next.currentSet += 1
        next.currentLeg = 1
      } else {
        next.currentLeg += 1
      }

      // Nieuwe leg: scores resetten, beginspeler wisselt
      next.scores = config.players.map(() => config.startingScore)
      next.legStarter = (p.legStarter + 1) % n
      next.activePlayer = next.legStarter
    } else {
      // Gewone beurt of bust: score bijwerken (bij bust blijft 'before' staan), volgende speler
      next.scores[active] = isBust ? before : remaining
      next.activePlayer = (active + 1) % n
    }

    return { past: [...state.past, p], present: next }
  }
}

export function useX01Game(config: GameConfig) {
  const [state, dispatch] = useReducer(reducer(config), undefined, () => ({
    past: [],
    present: initCore(config),
  }))

  return {
    ...state.present,
    canUndo: state.past.length > 0,
    config,
    submit: (payload: SubmitPayload) => dispatch({ type: 'submit', payload }),
    undo: () => dispatch({ type: 'undo' }),
  }
}

/** 3-dart gemiddelde per speler op basis van alle visits (busts tellen mee als 0 punten). */
export function playerAverage(visits: Visit[], player: number): number {
  let points = 0
  let darts = 0
  for (const v of visits) {
    if (v.player !== player) continue
    points += v.points
    darts += v.darts
  }
  return darts === 0 ? 0 : (points / darts) * 3
}

/** Aantal rondes en darts van een speler in de huidige leg. */
export function legStats(
  visits: Visit[],
  player: number,
  leg: number,
  set: number
): { rounds: number; darts: number } {
  let rounds = 0
  let darts = 0
  for (const v of visits) {
    if (v.player === player && v.leg === leg && v.set === set) {
      rounds += 1
      darts += v.darts
    }
  }
  return { rounds, darts }
}

/** De laatste visit van een speler in de huidige leg (voor weergave). */
export function lastVisit(
  visits: Visit[],
  player: number,
  leg: number,
  set: number
): Visit | null {
  for (let i = visits.length - 1; i >= 0; i--) {
    const v = visits[i]
    if (v.player === player && v.leg === leg && v.set === set) {
      return v
    }
  }
  return null
}
