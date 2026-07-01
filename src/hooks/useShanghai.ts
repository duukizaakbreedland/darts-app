import { useUndoable } from './useUndoable'

export type SegOutcome = 'single' | 'double' | 'triple' | 'miss'

export interface ShanghaiConfig {
  players: string[]
  rounds: number // aantal rondes (target ronde r = nummer r)
}

interface ShanghaiState {
  scores: number[]
  round: number // 1-based
  activePlayer: number
  turn: SegOutcome[] // darts deze beurt (0-3)
  hitSingle: boolean // bijhouden voor Shanghai-bonus deze beurt
  hitDouble: boolean
  hitTriple: boolean
  winner: number | null
  shanghai: boolean // gewonnen via Shanghai
}

type Action = { type: 'dart'; outcome: SegOutcome } | { type: 'pass' }

const mult = (o: SegOutcome) => (o === 'triple' ? 3 : o === 'double' ? 2 : o === 'single' ? 1 : 0)

function makeReducer(config: ShanghaiConfig) {
  const n = config.players.length

  return (s: ShanghaiState, a: Action): ShanghaiState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'dart') {
      if (s.turn.length >= 3) return s
      const target = s.round
      const gained = mult(a.outcome) * target
      const scores = [...s.scores]
      scores[p] += gained
      const hitSingle = s.hitSingle || a.outcome === 'single'
      const hitDouble = s.hitDouble || a.outcome === 'double'
      const hitTriple = s.hitTriple || a.outcome === 'triple'
      const turn = [...s.turn, a.outcome]

      // Shanghai: single + double + triple van het rondenummer in één beurt = directe winst
      if (hitSingle && hitDouble && hitTriple) {
        return { ...s, scores, turn, hitSingle, hitDouble, hitTriple, winner: p, shanghai: true }
      }
      return { ...s, scores, turn, hitSingle, hitDouble, hitTriple }
    }

    // pass: pas als 3 darts gegooid
    if (s.turn.length < 3) return s
    const lastPlayer = p === n - 1
    const nextRound = lastPlayer ? s.round + 1 : s.round

    // Laatste ronde voorbij? → hoogste score wint
    if (lastPlayer && nextRound > config.rounds) {
      let best = 0
      for (let i = 1; i < n; i++) if (s.scores[i] > s.scores[best]) best = i
      return { ...s, winner: best, shanghai: false }
    }

    return {
      ...s,
      activePlayer: (p + 1) % n,
      round: nextRound,
      turn: [],
      hitSingle: false,
      hitDouble: false,
      hitTriple: false,
    }
  }
}

export function useShanghai(config: ShanghaiConfig) {
  const init: ShanghaiState = {
    scores: config.players.map(() => 0),
    round: 1,
    activePlayer: 0,
    turn: [],
    hitSingle: false,
    hitDouble: false,
    hitTriple: false,
    winner: null,
    shanghai: false,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  return {
    ...state,
    rounds: config.rounds,
    dart: (outcome: SegOutcome) => dispatch({ type: 'dart', outcome }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
