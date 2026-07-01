import { useUndoable } from './useUndoable'

// Bob's 27: rond de doubles D1..D20, dan bull. Start op 27.
// Per double 3 darts. Elke treffer: +waarde. Alles gemist: −waarde. Onder 0 = uit.
export const BOBS_TARGETS = [
  ...Array.from({ length: 20 }, (_, i) => i + 1), // 1..20 (= D1..D20)
  25, // bull
]

export function doubleValue(target: number): number {
  return target === 25 ? 50 : target * 2
}

export interface Bobs27Config {
  players: string[]
}

interface Bobs27State {
  scores: number[]
  eliminated: boolean[]
  played: boolean[] // heeft deze speler de huidige ronde al gegooid
  round: number // index in BOBS_TARGETS
  activePlayer: number
  turnHits: boolean[]
  winner: number | null
}

type Action = { type: 'dart'; hit: boolean } | { type: 'pass' }

const T = BOBS_TARGETS.length

function stillPlaying(s: Bobs27State): number[] {
  return s.scores.map((_, i) => i).filter(i => !s.eliminated[i])
}

function makeReducer(config: Bobs27Config) {
  const n = config.players.length

  return (s: Bobs27State, a: Action): Bobs27State => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'dart') {
      if (s.turnHits.length >= 3) return s
      return { ...s, turnHits: [...s.turnHits, a.hit] }
    }

    // pass: verwerk de 3 darts van speler p
    if (s.turnHits.length < 3) return s
    const hits = s.turnHits.filter(Boolean).length
    const val = doubleValue(BOBS_TARGETS[s.round])
    const scores = [...s.scores]
    const eliminated = [...s.eliminated]
    scores[p] += hits > 0 ? hits * val : -val
    if (scores[p] < 0) eliminated[p] = true

    const played = [...s.played]
    played[p] = true

    // Wie moet deze ronde nog? (niet-geëlimineerd, nog niet gespeeld)
    const remaining = scores.map((_, i) => i).filter(i => !played[i] && !eliminated[i])

    const alive = scores.map((_, i) => i).filter(i => !eliminated[i])
    // Einde-check: iedereen uit
    if (alive.length === 0) {
      let best = 0
      for (let i = 1; i < n; i++) if (scores[i] > scores[best]) best = i
      return { ...s, scores, eliminated, played, turnHits: [], winner: best }
    }

    if (remaining.length > 0) {
      // volgende speler deze ronde
      const na = remaining.find(i => i > p) ?? remaining[0]
      return { ...s, scores, eliminated, played, activePlayer: na, turnHits: [] }
    }

    // Ronde klaar → volgende ronde of einde
    const nextRound = s.round + 1
    if (nextRound >= T) {
      let best = 0
      for (let i = 1; i < n; i++) if (scores[i] > scores[best]) best = i
      return { ...s, scores, eliminated, played, turnHits: [], winner: best }
    }
    const freshPlayed = scores.map(() => false)
    const firstAlive = alive[0]
    return {
      ...s,
      scores,
      eliminated,
      played: freshPlayed,
      round: nextRound,
      activePlayer: firstAlive,
      turnHits: [],
    }
  }
}

export function useBobs27(config: Bobs27Config) {
  const init: Bobs27State = {
    scores: config.players.map(() => 27),
    eliminated: config.players.map(() => false),
    played: config.players.map(() => false),
    round: 0,
    activePlayer: 0,
    turnHits: [],
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  return {
    ...state,
    target: BOBS_TARGETS[state.round],
    targetValue: doubleValue(BOBS_TARGETS[state.round]),
    totalRounds: T,
    alivePlayers: stillPlaying(state),
    dart: (hit: boolean) => dispatch({ type: 'dart', hit }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
