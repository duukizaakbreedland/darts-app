import { useUndoable } from './useUndoable'

export type AtcHitMode = 'all' | 'single' | 'double' | 'triple'
export type DartOutcome = 'single' | 'double' | 'triple' | 'miss'

export interface AtcConfig {
  players: string[]
  targets: number[] // 1-20, 25 = bull (binnen/buiten telt), 50 = bullseye (alleen binnen)
  hitMode: AtcHitMode
  hitsRequired: number // 1-3
  increaseBySegment: boolean
}

interface AtcState {
  positions: number[] // index in targets per speler
  progress: number[] // aantal rake worpen op het huidige target (voor hitsRequired)
  activePlayer: number
  turnDarts: boolean[] // geldige raak of niet, voor de stippen
  winner: number | null
}

type AtcAction = { type: 'dart'; outcome: DartOutcome } | { type: 'pass' }

export function isBullTarget(target: number): boolean {
  return target === 25 || target === 50
}

function isValidHit(outcome: DartOutcome, target: number, hitMode: AtcHitMode): boolean {
  if (outcome === 'miss') return false
  if (isBullTarget(target)) return true // speler meldt zelf of de (juiste) bull geraakt is
  if (hitMode === 'all') return true
  return outcome === hitMode
}

function makeReducer(config: AtcConfig) {
  const n = config.players.length
  const T = config.targets.length

  return (s: AtcState, a: AtcAction): AtcState => {
    if (s.winner !== null) return s
    const p = s.activePlayer

    if (a.type === 'dart') {
      if (s.turnDarts.length >= 3) return s
      const target = config.targets[s.positions[p]]
      const valid = isValidHit(a.outcome, target, config.hitMode)
      const turnDarts = [...s.turnDarts, valid]
      if (!valid) return { ...s, turnDarts }

      let pos = s.positions[p]
      let prog = s.progress[p]

      if (config.increaseBySegment && !isBullTarget(target)) {
        const mult = a.outcome === 'triple' ? 3 : a.outcome === 'double' ? 2 : 1
        pos = Math.min(T, pos + mult)
        prog = 0
      } else {
        prog += 1
        if (prog >= config.hitsRequired) {
          pos += 1
          prog = 0
        }
      }

      const positions = [...s.positions]
      positions[p] = pos
      const progress = [...s.progress]
      progress[p] = prog
      return { positions, progress, activePlayer: p, turnDarts, winner: pos >= T ? p : null }
    }

    if (s.turnDarts.length < 3) return s
    return { ...s, activePlayer: (p + 1) % n, turnDarts: [] }
  }
}

export function useAroundTheClock(config: AtcConfig) {
  const init: AtcState = {
    positions: config.players.map(() => 0),
    progress: config.players.map(() => 0),
    activePlayer: 0,
    turnDarts: [],
    winner: null,
  }
  const { state, dispatch, undo } = useUndoable(makeReducer(config), init)

  return {
    ...state,
    targets: config.targets,
    hitMode: config.hitMode,
    hitsRequired: config.hitsRequired,
    increaseBySegment: config.increaseBySegment,
    dart: (outcome: DartOutcome) => dispatch({ type: 'dart', outcome }),
    pass: () => dispatch({ type: 'pass' }),
    undo,
  }
}
