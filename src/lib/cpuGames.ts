// CPU-strategieën voor de trainingsspellen, bovenop de gedeelde dartbord-engine.
import { throwDart, singleAim, doubleAim, tripleAim, BULL_AIM } from './dartboard'
import { cpuSigma, cpuDoubleChance } from './cpu'
import type { AtcHitMode, DartOutcome } from '../hooks/useAroundTheClock'
import type { SegOutcome } from '../hooks/useShanghai'

/** Around the Clock: de CPU mikt op het doel en meldt wat-ie gooide. */
export function cpuAtcDart(
  target: number,
  hitMode: AtcHitMode,
  increaseBySegment: boolean,
  level: number
): DartOutcome {
  const sigma = cpuSigma(level)

  // Bull / bullseye
  if (target === 25 || target === 50) {
    const res = throwDart(BULL_AIM, sigma)
    if (target === 50) return res.ring === 'inner-bull' ? 'single' : 'miss'
    return res.ring === 'inner-bull' || res.ring === 'outer-bull' ? 'single' : 'miss'
  }

  // Genummerd vak — kies mikpunt op basis van de regels
  let aim
  if (hitMode === 'double') aim = doubleAim(target)
  else if (hitMode === 'triple') aim = tripleAim(target)
  else if (hitMode === 'single') aim = singleAim(target)
  else aim = increaseBySegment ? tripleAim(target) : singleAim(target) // 'all'

  const res = throwDart(aim, sigma)
  if (res.number !== target) return 'miss'
  if (res.ring === 'triple') return 'triple'
  if (res.ring === 'double') return 'double'
  if (res.ring === 'single') return 'single'
  return 'miss'
}

/** Shanghai: de CPU mikt op de triple van het rondenummer (maximale score). */
export function cpuShanghaiDart(roundNumber: number, level: number): SegOutcome {
  const res = throwDart(tripleAim(roundNumber), cpuSigma(level))
  if (res.number !== roundNumber) return 'miss'
  if (res.ring === 'triple') return 'triple'
  if (res.ring === 'double') return 'double'
  if (res.ring === 'single') return 'single'
  return 'miss'
}

/** Cricket: kies een doel-nummer en gooi erop. Retourneert {numberIndex, marks} of null (mis). */
export function cpuCricketDart(
  numbers: number[],
  ownMarks: number[],
  allClosed: (numIdx: number) => boolean,
  level: number
): { numberIndex: number; marks: number } | null {
  // Doel: het eerste eigen nog-niet-gesloten nummer waar nog iets te halen valt
  let targetIdx = ownMarks.findIndex((m, idx) => m < 3 && !allClosed(idx))
  if (targetIdx === -1) targetIdx = ownMarks.findIndex((_, idx) => !allClosed(idx))
  if (targetIdx === -1) targetIdx = 0

  const num = numbers[targetIdx]
  const sigma = cpuSigma(level)
  const res = num === 25 ? throwDart(BULL_AIM, sigma) : throwDart(tripleAim(num), sigma)

  if (num === 25) {
    if (res.ring === 'inner-bull') return { numberIndex: targetIdx, marks: 2 }
    if (res.ring === 'outer-bull') return { numberIndex: targetIdx, marks: 1 }
    return null
  }
  if (res.number !== num) return null
  const marks = res.ring === 'triple' ? 3 : res.ring === 'double' ? 2 : res.ring === 'single' ? 1 : 0
  return marks > 0 ? { numberIndex: targetIdx, marks } : null
}

/** Bob's 27: raakt de CPU de double van het doelnummer? (target 25 = bull) */
export function cpuBobsHit(target: number, level: number): boolean {
  const sigma = cpuSigma(level)
  if (target === 25) {
    return throwDart(BULL_AIM, sigma).ring === 'inner-bull' // double-bull
  }
  const res = throwDart(doubleAim(target), sigma)
  return res.number === target && res.ring === 'double'
}

/** Singles Training: raakt de CPU de single van het doelnummer? (25 = bull) */
export function cpuSingleHit(target: number, level: number): boolean {
  const sigma = cpuSigma(level)
  if (target === 25) {
    const res = throwDart(BULL_AIM, sigma)
    return res.ring === 'inner-bull' || res.ring === 'outer-bull'
  }
  const res = throwDart(singleAim(target), sigma)
  return res.number === target && res.ring === 'single'
}

/** Checkout-training: haalt de CPU de finish? Zo ja, in hoeveel darts? (null = mislukt) */
export function cpuCheckoutResult(target: number, level: number): number | null {
  const chance = cpuDoubleChance(level)
  // Grotere finishes zijn moeilijker: schaal de basiskans wat af
  const scaled = target <= 40 ? chance * 1.4 : target <= 100 ? chance : chance * 0.75
  if (Math.random() < Math.min(0.9, scaled)) {
    // Aantal darts: makkelijke finishes vaak in 2-3, zelden 1
    const r = Math.random()
    return r < 0.15 ? 1 : r < 0.6 ? 2 : 3
  }
  return null
}
