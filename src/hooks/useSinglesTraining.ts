import { useUndoable } from './useUndoable'

// Singles Training: mik op single 1..20 (optioneel bull). Elke ronde schuif je
// door, of je nu raakt of niet. Score = aantal treffers. Hoogste score wint.
export interface SinglesConfig {
  players: string[]
  targets: number[] // 1..20, evt. 25
}

interface SinglesState {
  scores: number[]
  round: number // index in targets
  activePlayer: number
  turnDarts: boolean[] // treffers deze beurt
  played: boolean[] // gespeeld deze ronde
  winner: number | null
}

type Action = { type: 'dart'; hit: boolean } | { type: 'pass' }

function makeReducer(config: SinglesConfig) {
  const n = config.players.length
  const T = config.targets.length

  return (s: SinglesState, a: Action): SinglesState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'dart') {
      if (s.turnDarts.length >= 3) return s
      const scores = [...s.scores]
      if (a.hit) scores[p] += 1
      return { ...s, scores, turnDarts: [...s.turnDarts, a.hit] }
    }

    // pass
    if (s.turnDarts.length < 3) return s
    const played = [...s.played]
    played[p] = true
    const remaining = s.scores.map((_, i) => i).filter(i => !played[i])

    if (remaining.length > 0) {
      const na = remaining.find(i => i > p) ?? remaining[0]
      return { ...s, played, activePlayer: na, turnDarts: [] }
    }

    // ronde klaar
    const nextRound = s.round + 1
    if (nextRound >= T) {
      let best = 0
      for (let i = 1; i < n; i++) if (s.scores[i] > s.scores[best]) best = i
      return { ...s, played, turnDarts: [], winner: best }
    }
    return {
      ...s,
      played: s.scores.map(() => false),
      round: nextRound,
      activePlayer: 0,
      turnDarts: [],
    }
  }
}

export function useSinglesTraining(config: SinglesConfig) {
  const init: SinglesState = {
    scores: config.players.map(() => 0),
    round: 0,
    activePlayer: 0,
    turnDarts: [],
    played: config.players.map(() => false),
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  return {
    ...state,
    targets: config.targets,
    target: config.targets[state.round],
    totalRounds: config.targets.length,
    dart: (hit: boolean) => dispatch({ type: 'dart', hit }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
