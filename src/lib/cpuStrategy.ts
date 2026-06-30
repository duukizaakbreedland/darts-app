// CPU-hersenen voor X01: simuleert één beurt (max 3 darts) op basis van het niveau.
// Scoren gebeurt via het fysieke worp-model (spreiding); finishen via de
// gevloerde dubbel-kans, zodat lage niveaus tóch kunnen uitgooien.

import { throwDart, tripleAim, singleAim } from './dartboard'
import { cpuSigma, cpuDoubleChance } from './cpu'

export interface CpuTurn {
  points: number // punten deze beurt (0 bij bust)
  darts: number // aantal gegooide darts (1-3)
  checkout: boolean
  dartsAtDouble: number // darts op een dubbel (bij checkout)
}

function isDirectDouble(r: number): boolean {
  return r === 50 || (r >= 2 && r <= 40 && r % 2 === 0)
}

type Target =
  | { kind: 'double'; number: number } // number 25 = bull
  | { kind: 'score' } // mik T20
  | { kind: 'setup'; single: number } // mik op een single om een mooie dubbel over te laten

function chooseTarget(r: number): Target {
  if (isDirectDouble(r)) return { kind: 'double', number: r === 50 ? 25 : r / 2 }
  if (r > 60) return { kind: 'score' }
  // Probeer een mooie dubbel (32/40/16) over te laten met één single
  for (const leave of [32, 40, 16]) {
    const s = r - leave
    if (s >= 1 && s <= 20) return { kind: 'setup', single: s }
  }
  if (r > 40) return { kind: 'setup', single: 20 }
  const s = r - 2
  return { kind: 'setup', single: s >= 1 && s <= 20 ? s : 1 }
}

export function simulateCpuTurn(remaining: number, level: number): CpuTurn {
  const sigma = cpuSigma(level)
  const dChance = cpuDoubleChance(level)
  let r = remaining
  let dartsAtDouble = 0

  for (let d = 1; d <= 3; d++) {
    const target = chooseTarget(r)

    if (target.kind === 'double') {
      dartsAtDouble++
      if (Math.random() < dChance) {
        return { points: remaining, darts: d, checkout: true, dartsAtDouble }
      }
      // Mis: ~45% in de single van datzelfde getal (zet de volgende dubbel op)
      if (Math.random() < 0.45) {
        const single = target.number === 25 ? 25 : target.number
        if (r - single >= 2) r -= single
      }
      continue
    }

    const aim = target.kind === 'score' ? tripleAim(20) : singleAim(target.single)
    const res = throwDart(aim, sigma)
    const after = r - res.value

    if (after < 0 || after === 1) {
      return { points: 0, darts: 3, checkout: false, dartsAtDouble: 0 } // bust
    }
    if (after === 0) {
      // Op 0 telt alleen als de laatste dart een dubbel (of bull) was
      if (res.ring === 'double' || res.ring === 'inner-bull') {
        return { points: remaining, darts: d, checkout: true, dartsAtDouble: dartsAtDouble + 1 }
      }
      return { points: 0, darts: 3, checkout: false, dartsAtDouble: 0 } // op 0 zonder dubbel = bust
    }
    r = after
  }

  return { points: remaining - r, darts: 3, checkout: false, dartsAtDouble: 0 }
}
