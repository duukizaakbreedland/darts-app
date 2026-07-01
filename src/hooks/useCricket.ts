import { useUndoable } from './useUndoable'

// Cricket-nummers: 15-20 + bull (25). 3 marks = gesloten.
export const CRICKET_NUMBERS = [20, 19, 18, 17, 16, 15, 25]

export interface CricketConfig {
  players: string[]
  scoring: boolean // met punten (klassiek) of "no-score" (puur sluiten)
}

interface CricketState {
  marks: number[][] // marks[player][numberIndex] 0-3+
  scores: number[]
  activePlayer: number
  turnDarts: number // aantal gegooide darts deze beurt (0-3)
  winner: number | null
}

// Een worp: nummer (uit CRICKET_NUMBERS) + aantal marks (1=single,2=double,3=triple), of miss
type Action = { type: 'hit'; numberIndex: number; marks: number } | { type: 'miss' } | { type: 'pass' }

const numberValue = (idx: number) => CRICKET_NUMBERS[idx] // 20..15, 25

function isClosedByAll(state: CricketState, numIdx: number, exclude: number): boolean {
  return state.marks.every((m, pi) => pi === exclude || m[numIdx] >= 3)
}

function checkWinner(state: CricketState, config: CricketConfig, n: number): number | null {
  for (let p = 0; p < n; p++) {
    const allClosed = CRICKET_NUMBERS.every((_, idx) => state.marks[p][idx] >= 3)
    if (!allClosed) continue
    if (!config.scoring) return p
    const maxOther = Math.max(...state.scores.filter((_, i) => i !== p), -1)
    if (state.scores[p] >= maxOther) return p
  }
  return null
}

function makeReducer(config: CricketConfig) {
  const n = config.players.length

  return (s: CricketState, a: Action): CricketState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'pass') {
      if (s.turnDarts < 3) return s
      return { ...s, activePlayer: (p + 1) % n, turnDarts: 0 }
    }

    if (s.turnDarts >= 3) return s

    if (a.type === 'miss') {
      return { ...s, turnDarts: s.turnDarts + 1 }
    }

    // hit
    const { numberIndex, marks } = a
    const current = s.marks[p][numberIndex]
    const toClose = Math.max(0, 3 - current)
    const closingMarks = Math.min(marks, toClose)
    const scoringMarks = marks - closingMarks

    const newMarks = s.marks.map(row => [...row])
    newMarks[p][numberIndex] = current + marks

    const newScores = [...s.scores]
    if (config.scoring && scoringMarks > 0 && !isClosedByAll(s, numberIndex, p)) {
      newScores[p] += scoringMarks * numberValue(numberIndex)
    }

    const next: CricketState = {
      ...s,
      marks: newMarks,
      scores: newScores,
      turnDarts: s.turnDarts + 1,
    }
    next.winner = checkWinner(next, config, n)
    return next
  }
}

export function useCricket(config: CricketConfig) {
  const init: CricketState = {
    marks: config.players.map(() => CRICKET_NUMBERS.map(() => 0)),
    scores: config.players.map(() => 0),
    activePlayer: 0,
    turnDarts: 0,
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  return {
    ...state,
    scoring: config.scoring,
    hit: (numberIndex: number, marks: number) => dispatch({ type: 'hit', numberIndex, marks }),
    miss: () => dispatch({ type: 'miss' }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
