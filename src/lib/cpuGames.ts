// CPU-strategieën voor de trainingsspellen, bovenop de gedeelde dartbord-engine.
import { throwDart, singleAim, doubleAim, tripleAim, BULL_AIM } from './dartboard'
import { cpuSigma } from './cpu'
import type { AtcHitMode, DartOutcome } from '../hooks/useAroundTheClock'

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
