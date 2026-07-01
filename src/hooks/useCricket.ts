import { useUndoable } from './useUndoable'

// Standaard Cricket: 15-20 + bull. Tactics: 10-20 + bull.
export const CRICKET_NUMBERS_STANDARD = [20, 19, 18, 17, 16, 15, 25]
export const CRICKET_NUMBERS_TACTICS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 25]

export interface CricketConfig {
  players: string[]
  numbers: number[] // welke nummers (standaard of tactics)
  scoring: boolean // met punten of alleen sluiten
  legsToWin: number // legs nodig voor een set
  setsToWin: number // sets nodig voor de match
}

interface CricketState {
  marks: number[][] // marks[player][numberIndex]
  scores: number[]
  legsWon: number[]
  setsWon: number[]
  activePlayer: number
  legStarter: number
  currentLeg: number
  currentSet: number
  turnDarts: number
  winner: number | null // matchwinnaar
}

type Action = { type: 'hit'; numberIndex: number; marks: number } | { type: 'miss' } | { type: 'pass' }

function isClosedByAll(marks: number[][], numIdx: number, exclude: number): boolean {
  return marks.every((m, pi) => pi === exclude || m[numIdx] >= 3)
}

/** Heeft speler p de leg gewonnen? (alles gesloten + niet achter op punten) */
function legWinner(state: CricketState, config: CricketConfig): number | null {
  for (let p = 0; p < config.players.length; p++) {
    const allClosed = config.numbers.every((_, idx) => state.marks[p][idx] >= 3)
    if (!allClosed) continue
    if (!config.scoring) return p
    const maxOther = Math.max(...state.scores.filter((_, i) => i !== p), -1)
    if (state.scores[p] >= maxOther) return p
  }
  return null
}

function freshBoard(config: CricketConfig) {
  return {
    marks: config.players.map(() => config.numbers.map(() => 0)),
    scores: config.players.map(() => 0),
  }
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

    let next: CricketState

    if (a.type === 'miss') {
      next = { ...s, turnDarts: s.turnDarts + 1 }
    } else {
      const { numberIndex, marks } = a
      const current = s.marks[p][numberIndex]
      const toClose = Math.max(0, 3 - current)
      const scoringMarks = marks - Math.min(marks, toClose)

      const newMarks = s.marks.map(row => [...row])
      newMarks[p][numberIndex] = current + marks

      const newScores = [...s.scores]
      if (config.scoring && scoringMarks > 0 && !isClosedByAll(s.marks, numberIndex, p)) {
        newScores[p] += scoringMarks * config.numbers[numberIndex]
      }
      next = { ...s, marks: newMarks, scores: newScores, turnDarts: s.turnDarts + 1 }
    }

    // Leg gewonnen?
    const legWon = legWinner(next, config)
    if (legWon !== null) {
      const legsWon = [...next.legsWon]
      legsWon[legWon] += 1

      if (legsWon[legWon] >= config.legsToWin) {
        const setsWon = [...next.setsWon]
        setsWon[legWon] += 1
        if (setsWon[legWon] >= config.setsToWin) {
          return { ...next, legsWon, setsWon, winner: legWon }
        }
        // nieuwe set
        const starter = (next.legStarter + 1) % n
        return {
          ...next,
          ...freshBoard(config),
          legsWon: config.players.map(() => 0),
          setsWon,
          currentSet: next.currentSet + 1,
          currentLeg: 1,
          legStarter: starter,
          activePlayer: starter,
          turnDarts: 0,
        }
      }
      // nieuwe leg
      const starter = (next.legStarter + 1) % n
      return {
        ...next,
        ...freshBoard(config),
        legsWon,
        currentLeg: next.currentLeg + 1,
        legStarter: starter,
        activePlayer: starter,
        turnDarts: 0,
      }
    }

    return next
  }
}

export function useCricket(config: CricketConfig) {
  const board = freshBoard(config)
  const init: CricketState = {
    ...board,
    legsWon: config.players.map(() => 0),
    setsWon: config.players.map(() => 0),
    activePlayer: 0,
    legStarter: 0,
    currentLeg: 1,
    currentSet: 1,
    turnDarts: 0,
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  return {
    ...state,
    numbers: config.numbers,
    scoring: config.scoring,
    hit: (numberIndex: number, marks: number) => dispatch({ type: 'hit', numberIndex, marks }),
    miss: () => dispatch({ type: 'miss' }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
