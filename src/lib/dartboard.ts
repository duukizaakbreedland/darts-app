// Dartbord-engine: geometrie + worp-model. Herbruikbaar voor alle spelmodi.
// Coördinaten in mm, oorsprong = centrum van de bull.

export type Ring = 'inner-bull' | 'outer-bull' | 'single' | 'triple' | 'double' | 'miss'

export interface DartResult {
  value: number // gescoorde punten
  ring: Ring
  number: number // het vak (1-20); 25/50 bij bull; 0 bij mis
}

export interface Point {
  x: number
  y: number
}

// Volgorde van de vakken met de klok mee, beginnend bovenaan (20)
export const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

const R_INNER_BULL = 6.35
const R_OUTER_BULL = 15.9
const R_TRIPLE_IN = 99
const R_TRIPLE_OUT = 107
const R_DOUBLE_IN = 162
const R_DOUBLE_OUT = 170

/** Waar komt een dart op coördinaat (x,y) terecht? */
export function scoreAt(x: number, y: number): DartResult {
  const r = Math.hypot(x, y)
  if (r <= R_INNER_BULL) return { value: 50, ring: 'inner-bull', number: 50 }
  if (r <= R_OUTER_BULL) return { value: 25, ring: 'outer-bull', number: 25 }
  if (r > R_DOUBLE_OUT) return { value: 0, ring: 'miss', number: 0 }

  let ang = (Math.atan2(x, y) * 180) / Math.PI // 0 = boven, +90 = rechts (met de klok mee)
  if (ang < 0) ang += 360
  const idx = Math.floor((ang + 9) / 18) % 20
  const num = NUMBERS[idx]

  if (r >= R_TRIPLE_IN && r <= R_TRIPLE_OUT) return { value: num * 3, ring: 'triple', number: num }
  if (r >= R_DOUBLE_IN && r <= R_DOUBLE_OUT) return { value: num * 2, ring: 'double', number: num }
  return { value: num, ring: 'single', number: num }
}

// ─── Mikpunten ───────────────────────────────────────────────────────────────
function aimAt(num: number, radius: number): Point {
  const idx = NUMBERS.indexOf(num)
  const ang = (idx * 18 * Math.PI) / 180
  return { x: radius * Math.sin(ang), y: radius * Math.cos(ang) }
}

export function tripleAim(num: number): Point {
  return aimAt(num, (R_TRIPLE_IN + R_TRIPLE_OUT) / 2)
}
export function doubleAim(num: number): Point {
  return aimAt(num, (R_DOUBLE_IN + R_DOUBLE_OUT) / 2)
}
export function singleAim(num: number): Point {
  // Het grote binnen-single-vlak (tussen bull en triple)
  return aimAt(num, (R_OUTER_BULL + R_TRIPLE_IN) / 2)
}
export const BULL_AIM: Point = { x: 0, y: 0 }

// ─── Worp-model: mik + Gaussische ruis ───────────────────────────────────────
function gaussian(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Gooi één dart op een mikpunt met gegeven spreiding (sigma in mm). */
export function throwDart(aim: Point, sigma: number): DartResult {
  return scoreAt(aim.x + gaussian() * sigma, aim.y + gaussian() * sigma)
}
