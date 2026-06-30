import { useUndoable } from './useUndoable'

export interface AtcConfig {
  players: string[]
  targets: number[] // bv [1..20] of [1..20, 25]
}

interface AtcState {
  positions: number[] // hoeveel targets gehaald per speler
  activePlayer: number
  turnDarts: boolean[] // resultaten van de darts deze beurt (0-3)
  winner: number | null
}

type AtcAction = { type: 'dart'; hit: boolean } | { type: 'pass' }

function makeReducer(config: AtcConfig) {
  const n = config.players.length
  const T = config.targets.length

  return (s: AtcState, a: AtcAction): AtcState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'dart') {
      if (s.turnDarts.length >= 3) return s
      let pos = s.positions[p]
      if (a.hit && pos < T) pos++
      const positions = [...s.positions]
      positions[p] = pos
      return {
        positions,
        activePlayer: p,
        turnDarts: [...s.turnDarts, a.hit],
        winner: pos >= T ? p : null,
      }
    }

    // pass: pas door als alle 3 de darts gegooid zijn
    if (s.turnDarts.length < 3) return s
    return { ...s, activePlayer: (p + 1) % n, turnDarts: [] }
  }
}

export function useAroundTheClock(config: AtcConfig) {
  const init: AtcState = {
    positions: config.players.map(() => 0),
    activePlayer: 0,
    turnDarts: [],
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)

  return {
    ...state,
    targets: config.targets,
    dart: (hit: boolean) => dispatch({ type: 'dart', hit }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
