// Kalibratie van de CPU-niveaus: zoek per niveau de spreiding (sigma, in mm)
// zodat het 3-dart gemiddelde (mikkend op T20) het doel haalt, en meet het dubbel-%.

// ─── Dartbord-geometrie (mm, oorsprong = bull-centrum) ───────────────────────
const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const R_INNER_BULL = 6.35
const R_OUTER_BULL = 15.9
const R_TRIPLE_IN = 99
const R_TRIPLE_OUT = 107
const R_DOUBLE_IN = 162
const R_DOUBLE_OUT = 170

function scoreAt(x, y) {
  const r = Math.hypot(x, y)
  if (r <= R_INNER_BULL) return { value: 50, ring: 'inner-bull' }
  if (r <= R_OUTER_BULL) return { value: 25, ring: 'outer-bull' }
  if (r > R_DOUBLE_OUT) return { value: 0, ring: 'miss' }
  let ang = (Math.atan2(x, y) * 180) / Math.PI // 0 = boven, +90 = rechts (met de klok mee)
  if (ang < 0) ang += 360
  const idx = Math.floor((ang + 9) / 18) % 20
  const num = NUMBERS[idx]
  if (r >= R_TRIPLE_IN && r <= R_TRIPLE_OUT) return { value: num * 3, ring: 'triple' }
  if (r >= R_DOUBLE_IN && r <= R_DOUBLE_OUT) return { value: num * 2, ring: 'double' }
  return { value: num, ring: 'single' }
}

// ─── Gaussische ruis (Box-Muller) ────────────────────────────────────────────
function gauss() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function throwAt(ax, ay, sigma) {
  return scoreAt(ax + gauss() * sigma, ay + gauss() * sigma)
}

// ─── Mikpunten ───────────────────────────────────────────────────────────────
const T20 = { x: 0, y: (R_TRIPLE_IN + R_TRIPLE_OUT) / 2 } // (0, 103)
function doubleAim(num) {
  const idx = NUMBERS.indexOf(num)
  const ang = (idx * 18 * Math.PI) / 180
  const r = (R_DOUBLE_IN + R_DOUBLE_OUT) / 2 // 166
  return { x: r * Math.sin(ang), y: r * Math.cos(ang) }
}

// ─── Metingen ────────────────────────────────────────────────────────────────
function threeDartAvg(sigma, turns) {
  let total = 0
  for (let i = 0; i < turns; i++) {
    for (let d = 0; d < 3; d++) total += throwAt(T20.x, T20.y, sigma).value
  }
  return total / turns // gemiddelde per 3 darts
}

function doublePct(sigma, num, n) {
  const aim = doubleAim(num)
  let hit = 0
  for (let i = 0; i < n; i++) {
    const s = throwAt(aim.x, aim.y, sigma)
    if (s.ring === 'double' && s.value === num * 2) hit++
  }
  return (hit / n) * 100
}

// sigma decreases avg monotoon; binaire zoektocht naar doel-gemiddelde
function sigmaForAvg(target) {
  let lo = 3, hi = 160 // lo = strak (hoog gem), hi = wijd (laag gem)
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2
    const a = threeDartAvg(mid, 6000)
    if (a > target) lo = mid // te hoog gemiddelde -> meer spreiding nodig
    else hi = mid
  }
  return (lo + hi) / 2
}

// ─── Draaien ─────────────────────────────────────────────────────────────────
console.log('Niveau | doel | sigma(mm) | gemeten gem | dubbel-%(D20)')
console.log('-------|------|-----------|-------------|--------------')
const sigmas = []
for (let lvl = 1; lvl <= 10; lvl++) {
  const target = 25 + lvl * 5 // 30..75
  const sigma = sigmaForAvg(target)
  const measured = threeDartAvg(sigma, 40000)
  const dpct = doublePct(sigma, 20, 80000)
  sigmas.push(+sigma.toFixed(1))
  console.log(
    `  ${String(lvl).padStart(2)}   |  ${target}  |   ${sigma.toFixed(1).padStart(5)}   |    ${measured.toFixed(1).padStart(5)}    |     ${dpct.toFixed(1)}`
  )
}
console.log('\nSIGMA_BY_LEVEL =', JSON.stringify(sigmas))
