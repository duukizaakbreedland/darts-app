// CPU-strategieën voor de trainingsspellen, bovenop de gedeelde dartbord-engine.
import { throwDart, singleAim, BULL_AIM } from './dartboard'
import { cpuSigma } from './cpu'

/** Around the Clock: mikt de CPU op het doelnummer — raakt-ie het? (25 = bull) */
export function cpuAtcHit(target: number, level: number): boolean {
  const sigma = cpuSigma(level)
  if (target === 25) {
    const res = throwDart(BULL_AIM, sigma)
    return res.ring === 'inner-bull' || res.ring === 'outer-bull'
  }
  return throwDart(singleAim(target), sigma).number === target
}
