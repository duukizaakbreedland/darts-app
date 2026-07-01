import { useUndoable } from './useUndoable'
import { isCheckoutable } from '../lib/checkouts'

export type CheckoutRange = 'easy' | 'medium' | 'hard' | 'all'

export interface CheckoutConfig {
  players: string[]
  range: CheckoutRange
  target: number // aantal geslaagde finishes om te winnen
  seed: number[] // vooraf gegenereerde reeks checkouts (gedeeld, gelijk voor iedereen)
}

interface CheckoutState {
  finishes: number[] // geslaagde finishes per speler
  attempts: number[] // pogingen per speler
  dartsUsed: number[] // totaal darts gebruikt bij geslaagde finishes (voor gem.)
  index: number // welke checkout uit de reeks (gedeeld)
  activePlayer: number
  winner: number | null
}

type Action = { type: 'result'; darts: number | null } // null = mislukt

export function checkoutBounds(range: CheckoutRange): [number, number] {
  if (range === 'easy') return [2, 60]
  if (range === 'medium') return [61, 120]
  if (range === 'hard') return [121, 170]
  return [2, 170]
}

/** Genereer een reeks geldige (uitgooibare) checkouts binnen een bereik. */
export function generateCheckouts(range: CheckoutRange, count: number): number[] {
  const [lo, hi] = checkoutBounds(range)
  const pool: number[] = []
  for (let v = lo; v <= hi; v++) if (isCheckoutable(v)) pool.push(v)
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(pool[Math.floor(Math.random() * pool.length)])
  return out
}

function makeReducer(config: CheckoutConfig) {
  const n = config.players.length

  return (s: CheckoutState, a: Action): CheckoutState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    const finishes = [...s.finishes]
    const attempts = [...s.attempts]
    const dartsUsed = [...s.dartsUsed]
    attempts[p] += 1
    if (a.darts != null) {
      finishes[p] += 1
      dartsUsed[p] += a.darts
    }

    const lastPlayer = p === n - 1
    const winner = finishes[p] >= config.target ? p : null

    return {
      finishes,
      attempts,
      dartsUsed,
      index: lastPlayer ? s.index + 1 : s.index,
      activePlayer: (p + 1) % n,
      winner,
    }
  }
}

export function useCheckout(config: CheckoutConfig) {
  const init: CheckoutState = {
    finishes: config.players.map(() => 0),
    attempts: config.players.map(() => 0),
    dartsUsed: config.players.map(() => 0),
    index: 0,
    activePlayer: 0,
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)
  const currentTarget = config.seed[state.index % config.seed.length]
  return {
    ...state,
    currentTarget,
    goalFinishes: config.target,
    result: (darts: number | null) => dispatch({ type: 'result', darts }),
    undo,
  }
}
